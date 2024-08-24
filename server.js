// server.js
const express = require('express');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
    points: 20, // 20 tasks per minute
    duration: 60, // Per minute
    blockDuration: 0, // Do not block, we will queue
    keyPrefix: 'task',
});

const rateLimiterPerSecond = new RateLimiterMemory({
    points: 1, // 1 task per second
    duration: 1, // Per second
    blockDuration: 0,
    keyPrefix: 'task-second',
});

// Task queueing system
const taskQueue = {};

const task = async (user_id) => {
    const logMessage = `${user_id}-task completed at-${Date.now()}`;
    console.log(logMessage);
    fs.appendFileSync(path.join(__dirname, 'task.log'), `${logMessage}\n`);
};

app.post('/api/v1/task', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    try {
        // First, check the 1 per second rate limiter
        await rateLimiterPerSecond.consume(user_id);
        // Then, check the 20 per minute rate limiter
        await rateLimiter.consume(user_id);

        // Check if there's a queue for this user
        if (!taskQueue[user_id]) {
            taskQueue[user_id] = [];
        }

        // Add the task to the user's queue
        taskQueue[user_id].push(task);

        // Process the user's queue if not already doing so
        if (taskQueue[user_id].length === 1) {
            processQueue(user_id);
        }

        res.json({ status: 'Task queued' });
    } catch (rateLimiterRes) {
        res.status(429).json({ error: 'Rate limit exceeded' });
    }
});

function processQueue(user_id) {
    if (taskQueue[user_id].length > 0) {
        const nextTask = taskQueue[user_id].shift();
        nextTask(user_id).then(() => {
            setTimeout(() => processQueue(user_id), 1000);
        });
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
