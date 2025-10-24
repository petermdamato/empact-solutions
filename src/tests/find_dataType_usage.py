import os
import re

SRC_DIR = "/Users/peterdamato/empact-solutions/src"
DATA_TYPES_FILE = os.path.join(SRC_DIR, "utils", "dataTypes.js")

# Files to ignore
IGNORE_FILES = {
    "/Users/peterdamato/empact-solutions/src/components/CSVUploader.js",
    "/Users/peterdamato/empact-solutions/src/utils/dataTypes.js",
}


def extract_keys(js_path):
    """Extract object keys from dataTypes.js"""
    with open(js_path, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = re.compile(r'["\']?([A-Za-z0-9_ -]+)["\']?\s*:')
    keys = pattern.findall(content)
    return list(sorted(set(k.strip() for k in keys if k.strip())))


def file_contains_key(filepath, key):
    """Check if a file contains a given key"""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()
        return re.search(rf"\b{re.escape(key)}\b", text) is not None
    except Exception:
        return False


def search_for_keys(keys):
    """Return list of keys not found anywhere except exempt files"""
    unused_keys = []

    for key in keys:
        found = False
        for root, _, files in os.walk(SRC_DIR):
            for filename in files:
                if not filename.endswith((".js", ".jsx", ".ts", ".tsx")):
                    continue
                filepath = os.path.join(root, filename)
                if filepath in IGNORE_FILES:
                    continue
                if file_contains_key(filepath, key):
                    found = True
                    break
            if found:
                break

        if not found:
            unused_keys.append(key)

    return unused_keys


def main():
    print("🔍 Extracting keys from dataTypes.js...")
    keys = extract_keys(DATA_TYPES_FILE)
    print(f"✅ Found {len(keys)} keys in dataTypes.js")

    print("📂 Searching src folder for usage...")
    unused = search_for_keys(keys)

    print(f"\n🚫 {len(unused)} keys not found in any file:")
    for key in unused:
        print(f"  • {key}")


if __name__ == "__main__":
    main()
