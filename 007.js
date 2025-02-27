class TaskQueue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.queue = [];
        this.activeCount = 0;
    }

    addTask(task) {
        return new Promise((resolve) => {
            this.queue.push({ task, resolve });
            this.processQueue();
        });
    }

    processQueue() {
        while (this.activeCount < this.concurrency && this.queue.length) {
            const { task, resolve } = this.queue.shift();
            this.activeCount++;
            task().then(() => {
                this.activeCount--;
                resolve();
                this.processQueue();
            });
        }
    }
}

// Example usage:
const taskQueue = new TaskQueue(3);

function createTask(id, duration) {
    return () => new Promise((resolve) => {
        console.log(`Task ${id} started`);
        setTimeout(() => {
            console.log(`Task ${id} completed`);
            resolve();
        }, duration);
    });
}

taskQueue.addTask(createTask(1, 1000));
taskQueue.addTask(createTask(2, 2000));
taskQueue.addTask(createTask(3, 3000));
taskQueue.addTask(createTask(4, 4000));
taskQueue.addTask(createTask(5, 5000));