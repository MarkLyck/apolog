"""Prepare an article save with each manifest image immediately after its heading.

Usage: python3 scripts/place-article-images.py article.json manifest.json save.json
This writes a save payload; it does not publish it.
"""

import json
import sys
from pathlib import Path


def place_images(blocks, images):
    by_heading = {image["headingId"]: image for image in images}
    image_ids = {image["id"] for image in images}
    if len(by_heading) != len(images) or len(image_ids) != len(images):
        raise ValueError("Each image and target heading must have a unique ID")
    existing_ids = {block["id"] for block in blocks}
    if not set(by_heading).issubset(existing_ids):
        raise ValueError("A target heading is missing from the article")

    result = []
    inserted = set()
    for block in blocks:
        if block["id"] in image_ids:
            if block["type"] != "image":
                raise ValueError("An image ID collides with an existing text block")
            continue
        result.append(block)
        image = by_heading.get(block["id"])
        if image is None:
            continue
        title = "".join(node["text"] for node in block.get("content", []))
        if block["type"] != "heading" or title != image["heading"]:
            raise ValueError(f"Target heading changed: {image['heading']}")
        if block["id"] in inserted:
            raise ValueError("A target heading appears more than once")
        if not image["alt"].strip() or min(image["width"], image["height"]) < 1:
            raise ValueError("Image needs alternative text and positive dimensions")
        result.append({
            **{key: image[key] for key in ("id", "src", "alt", "width", "height")},
            "type": "image",
        })
        inserted.add(block["id"])
    if inserted != set(by_heading):
        raise ValueError("Not all images were placed")
    return result


def main():
    article_path, manifest_path, output_path = map(Path, sys.argv[1:])
    article = json.loads(article_path.read_text())
    images = json.loads(manifest_path.read_text())
    blocks = place_images(article["document"]["blocks"], images)
    fields = (
        "contentWarning", "finding", "placements", "readingMinutes", "slug",
        "sources", "status", "summary", "tags", "title",
    )
    payload = {key: article[key] for key in fields if key in article}
    payload.update(
        id=article["_id"],
        expectedVersion=article["version"],
        document={**article["document"], "blocks": blocks},
    )
    output_path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Prepared {len(images)} images below their headings in {output_path}")


if __name__ == "__main__":
    main()
