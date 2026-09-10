import datetime

import feedparser
from django.core.management.base import BaseCommand

from news.models import NewsFeed
from news.services import enrich_article

RSS_FEEDS = [
    # Physiotherapy
    "https://mikereinold.com/feed",
    "https://www.e3rehab.com/feed",
    "https://www.physio-network.com/feed/",
    "https://www.physiotutors.com/feed/",
    "https://www.thesportphysio.com/feed/",
    "https://www.pogophysio.com.au/feed/",
    # Health & Medicine (ScienceDaily — fast, reliable)
    "https://www.sciencedaily.com/rss/health_medicine.xml",
    "https://www.sciencedaily.com/rss/science_society.xml",
    # PubMed / NCBI
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/1k-GZP-OPQNjL5EYkCQpS2kWCYFc-3P-yQRnNqVSfJ-b8j5oq/",
]


class Command(BaseCommand):
    help = "Scan physiotherapy RSS feeds, translate and save new articles."

    def handle(self, *args, **options):
        total_new = 0
        for feed_url in RSS_FEEDS:
            try:
                feed = feedparser.parse(feed_url)
            except Exception as exc:
                self.stderr.write(f"Error reading {feed_url}: {exc}")
                continue

            if getattr(feed, "bozo", False) and not feed.entries:
                self.stderr.write(f"Invalid feed: {feed_url}")
                continue

            for entry in feed.entries[:15]:
                link = (entry.get("link") or "").strip()
                if not link or NewsFeed.objects.filter(source_url=link).exists():
                    continue
                try:
                    payload = enrich_article(entry)
                except Exception as exc:
                    self.stderr.write(f"Error enriching article: {exc}")
                    continue

                is_relevant = self._is_physio_relevant(
                    payload.get("title_en", ""),
                    payload.get("summary_fa", "")
                )

                NewsFeed.objects.create(
                    source_url=payload["source_url"],
                    title_fa=payload["title_fa"],
                    title_en=payload["title_en"],
                    summary_fa=payload["summary_fa"],
                    image_url=payload["image_url"],
                    category=payload["category"],
                    published_at=datetime.date.today(),
                    is_published=is_relevant,
                )
                total_new += 1

        self.stdout.write(self.style.SUCCESS(f"{total_new} new articles saved."))
    
    def _is_physio_relevant(self, title: str, summary: str) -> bool:
        """Check if article is relevant to physiotherapy for auto-publish."""
        text = f"{title} {summary}".lower()
        physio_keywords = [
            "physiotherapy", "physical therapy", "rehabilitation",
            "physio", "exercise therapy", "musculoskeletal",
            "orthopedic", "sports injury", "back pain", "neck pain",
            "knee rehabilitation", "stroke recovery", "balance training",
            "manual therapy", "electrotherapy", "ultrasound therapy",
            "chiropractic", "osteopathy", "massage therapy",
            "spinal cord injury", "nerve damage", "chronic pain",
            "mobility", "gait training", "posture", "stretching",
            "strength training", "flexibility", "range of motion",
            "physical rehabilitation", "functional training",
            "core stability", "proprioception", "ergonomics",
            "workplace injury", "sports medicine", "athletic training",
            "fall prevention", "balance disorders", "vestibular",
            "pelvic floor", "cardiac rehabilitation", "pulmonary rehab",
            "pediatric therapy", "geriatric therapy", "neurological rehab",
            "fibromyalgia", "arthritis", "osteoporosis",
            "rotator cuff", "tendinitis", "bursitis",
            "sciatica", "herniated disc", "scoliosis",
            "carpal tunnel", "plantar fasciitis", "tendinopathy",
        ]
        return any(kw in text for kw in physio_keywords)