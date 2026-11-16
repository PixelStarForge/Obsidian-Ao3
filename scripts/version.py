#!/usr/bin/env python3
"""
Obsidian AO3 - Version Management & Release Packaging Utility
Usage:
    python3 scripts/version.py                # Show current version
    python3 scripts/version.py 1.4            # Set explicit version
    python3 scripts/version.py patch          # Bump patch (1.4 -> 1.4.1)
    python3 scripts/version.py minor          # Bump minor (1.4 -> 1.5)
    python3 scripts/version.py major          # Bump major (1.4 -> 2.0)
    python3 scripts/version.py --bundle       # Package extension zip
    python3 scripts/version.py 1.4 --release  # Bump, commit, tag, and bundle
"""

import sys
import os
import json
import re
import argparse
import subprocess
import zipfile
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
MANIFEST_PATH = ROOT_DIR / "manifest.json"
DIST_DIR = ROOT_DIR / "dist"

def get_current_version() -> str:
    if not MANIFEST_PATH.exists():
        sys.exit(f"Error: manifest.json not found at {MANIFEST_PATH}")
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("version", "0.0.0")

def set_version(new_version: str):
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    data["version"] = new_version
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        f.write("\n")
    print(f"Version updated: {new_version}")

def calculate_bump(current: str, bump_type: str) -> str:
    parts = [int(p) for p in re.findall(r"\d+", current)]
    while len(parts) < 2:
        parts.append(0)

    if bump_type == "patch":
        if len(parts) == 2:
            parts.append(1)
        else:
            parts[2] += 1
    elif bump_type == "minor":
        parts[1] += 1
        if len(parts) > 2:
            parts[2] = 0
    elif bump_type == "major":
        parts[0] += 1
        parts[1] = 0
        if len(parts) > 2:
            parts[2] = 0
    else:
        sys.exit(f"Unknown bump type: {bump_type}. Use 'patch', 'minor', 'major', or an explicit version string like '1.4'.")

    return ".".join(str(p) for p in parts)

def create_bundle(version: str) -> Path:
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = DIST_DIR / f"obsidian-ao3-v{version}.zip"

    # Files to explicitly include
    files_to_pack = []
    
    # Add manifest.json
    files_to_pack.append(("manifest.json", MANIFEST_PATH))

    # Add src/ directory recursively
    src_dir = ROOT_DIR / "src"
    for root, _, files in os.walk(src_dir):
        for file in files:
            full_path = Path(root) / file
            rel_path = full_path.relative_to(ROOT_DIR)
            files_to_pack.append((str(rel_path), full_path))

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for archive_name, disk_path in files_to_pack:
            zf.write(disk_path, arcname=archive_name)

    print(f"Package created: {zip_path} ({len(files_to_pack)} files)")
    return zip_path

def git_commit_and_tag(version: str):
    tag = f"v{version}"
    try:
        subprocess.run(["git", "add", "manifest.json"], check=True, cwd=ROOT_DIR)
        subprocess.run(["git", "commit", "-m", f"chore: bump version to {version}"], check=True, cwd=ROOT_DIR)
        subprocess.run(["git", "tag", "-a", tag, "-m", f"Release {tag}"], check=True, cwd=ROOT_DIR)
        print(f"Git commit created and tagged as {tag}")
        print(f"Push with: git push origin main && git push origin {tag}")
    except subprocess.CalledProcessError as e:
        print(f"Git operation failed: {e}")

def main():
    parser = argparse.ArgumentParser(description="Obsidian AO3 Version Manager")
    parser.add_argument(
        "target",
        nargs="?",
        default=None,
        help="Target version (e.g. '1.4') or bump type ('patch', 'minor', 'major'). If omitted, prints current version."
    )
    parser.add_argument(
        "--bundle", "-b",
        action="store_true",
        help="Create production zip bundle in dist/ (excludes docs, pictures, README, .gitignore)"
    )
    parser.add_argument(
        "--commit", "-c",
        action="store_true",
        help="Commit updated manifest.json to git"
    )
    parser.add_argument(
        "--tag", "-t",
        action="store_true",
        help="Create annotated git tag for current/new version"
    )
    parser.add_argument(
        "--release",
        action="store_true",
        help="Full release: bump, commit, tag, and bundle"
    )

    args = parser.parse_args()

    current_ver = get_current_version()

    if args.target:
        if args.target in ("patch", "minor", "major"):
            new_ver = calculate_bump(current_ver, args.target)
        else:
            if not re.match(r"^\d+(\.\d+)+$", args.target):
                sys.exit(f"Invalid version format: '{args.target}'. Expected format like '1.4' or '1.4.0'.")
            new_ver = args.target

        set_version(new_ver)
        active_ver = new_ver
    else:
        active_ver = current_ver
        if not (args.bundle or args.commit or args.tag or args.release):
            print(current_ver)
            return

    if args.release:
        git_commit_and_tag(active_ver)
        create_bundle(active_ver)
    else:
        if args.commit and not args.tag:
            subprocess.run(["git", "add", "manifest.json"], check=True, cwd=ROOT_DIR)
            subprocess.run(["git", "commit", "-m", f"chore: bump version to {active_ver}"], check=True, cwd=ROOT_DIR)
        elif args.tag and not args.commit:
            subprocess.run(["git", "tag", "-a", f"v{active_ver}", "-m", f"Release v{active_ver}"], check=True, cwd=ROOT_DIR)
        elif args.commit and args.tag:
            git_commit_and_tag(active_ver)

        if args.bundle:
            create_bundle(active_ver)

if __name__ == "__main__":
    main()
