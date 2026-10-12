from redis import Redis
from rq import Queue

from app.config import settings

redis_conn = Redis.from_url(settings.REDIS_URL)
import_queue = Queue("imports", connection=redis_conn)
