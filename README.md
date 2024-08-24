# Node.js API Cluster with Rate Limiting and Task Queuing

## Overview

This project sets up a Node.js API cluster with two replica sets, using rate limiting to handle task processing for each user ID. Each user is limited to one task per second and 20 tasks per minute. Tasks exceeding the rate limit are queued and processed according to the defined limits.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.

## Running the Application

Start the application by running:

```bash
npm start
