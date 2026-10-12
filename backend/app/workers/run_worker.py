from rq import SimpleWorker

from app.workers.queue import import_queue, redis_conn

# SimpleWorker (not the default fork-based Worker) because RQ's default
# worker relies on os.fork, which native Windows does not support.
if __name__ == "__main__":
    worker = SimpleWorker([import_queue], connection=redis_conn)
    worker.work()
