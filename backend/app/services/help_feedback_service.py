from sqlalchemy.orm import Session

from app.models.help_article_feedback import HelpArticleFeedback


def submit_feedback(db: Session, slug: str, helpful: bool) -> None:
    db.add(HelpArticleFeedback(slug=slug, helpful=helpful))
    db.commit()
