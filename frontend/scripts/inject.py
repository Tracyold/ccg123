#!/usr/bin/env python3
"""
inject.py — Smart file injection script for Cutting Corners Gems
─────────────────────────────────────────────────────────────────
Usage:
  io go:../pg // folder:file:tsx = recorder:users
  io short:recorder=rec & hand=hd
  io go:../comp/intscr..432 // find:background // put-after:-color: var(--bg);

Spacing rules:
  command:content     no space between command and content
  content // command: space // space separates commands
  imp../path          imp has no :, path follows directly
  folder = x:y        space = space assigns names

Commands:
  go:../path..line        set target file or directory + optional line hint
  find:text               find exact text on the line set by go:
  find:empty              find all empty lines in the file
  find:empty..345-876     find empty lines between those line numbers
  put-after:content       append content inline after the found match
  put-before:content      insert content inline before the found match
  put-replace:content     replace the found match with content
  add                     signals next token is content to add (line must be empty)
  imp../path              add import after last import in current file
  see:345-456             print those lines to terminal
  del:text                delete first line containing exact text
  folder = name           create a folder in the current go: directory
  folder:file:tsx = folder:file  create folder + file inside it
  short:word=sh & word=sh add custom shorthands (persists to inject-shorthands.json)

File shorthands (built-in):
  pg=pages      comp=components  sty=styles    lib=lib     hook=hooks
  fs=feasibility  ck=check       wiz=Wizard    wz=wizard
  int=intro     scr=screen       indx=index    shp=shop    port=portfolio
  front=frontend  acc=account    CP=ChatPanel  inq=Inquiry
  inv=Invoice   res=Results      dtail=Detail  ord=Order
  usrs=users    wid=Widget       mod=Modal

Auto-extension:
  ../sty/ folder  → always .css
  ../pg/  folder  → always .tsx
  combined tokens → .tsx  (intscr → IntroScreen.tsx)
  dashed tokens   → .ts   (int-scr → intro-screen.ts)
  single token    → you must provide extension

Capitalization:
  wiz  → Wizard   (capital W)    wz   → wizard   (lowercase)
  intscr  → IntroScreen          int-scr → intro-screen

Examples:
  io go:../pg // folder:file:tsx = recorder:users
    creates pages/recorder/users.tsx

  io go:../pg/acc // folder:file:tsx = settings:panel
    creates pages/account/settings/panel.tsx

  io go:../comp/intscr..432 // find:background // put-after:-color: var(--bg);
    appends -color: var(--bg); after background on line 432

  io go:../sty/glob // add // imp../sty/wz
    adds import '../styles/wizard.css' to styles/global.css

  io short:recorder=rec & dashboard=dash & profile=prof
    adds rec, dash, prof as shorthands
"""

import sys
import os
import re
import json

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR      = os.path.dirname(os.path.abspath(__file__))
SHORTHANDS_FILE = os.path.join(SCRIPT_DIR, 'inject-shorthands.json')

# ── Built-in word shorthands ─────────────────────────────────────────────────
# Order matters — longer tokens must come before shorter ones sharing a prefix
WORDS = [
    ('dtail', 'Detail'),
    ('front', 'frontend'),
    ('port',  'portfolio'),
    ('usrs',  'users'),
    ('ind',  'index'),
    ('comp',  'components'),
    ('inq',   'Inquiry'),
    ('inv',   'Invoice'),
    ('res',   'Results'),
    ('ord',   'Order'),
    ('wig',   'Widget'),
    ('mod',   'Modal'),
    ('acc',   'account'),
    ('shp',   'shop'),
    ('int',   'intro'),
    ('scr',   'screen'),
    ('sty',   'styles'),
    ('lib',   'lib'),
    ('hook',  'hooks'),
    ('CP',    'ChatPanel'),
    ('wiz',   'Wizard'),   # capital W
    ('wz',    'wizard'),   # lowercase
    ('pg',    'pages'),
    ('fs',    'feasibility'),
    ('ck',    'check'),
]

FOLDER_EXT = {
    'styles': '.css',
    'pages':  '.tsx',
}

IMPORT_PREFIX = {
    'sty':  '../styles/',
    'comp': '../components/',
    'lib':  '../lib/',
    'hook': '../hooks/',
    'pg':   '../pages/',
}

EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.md']


# ── Shorthand persistence ────────────────────────────────────────────────────
def load_shorthands():
    """Load user-defined shorthands from JSON and merge into WORDS."""
    global WORDS
    if not os.path.exists(SHORTHANDS_FILE):
        return
    try:
        with open(SHORTHANDS_FILE, 'r') as f:
            saved = json.load(f)  # list of [shorthand, word]
        # Sort by shorthand length descending so longer tokens match first
        custom = sorted([(s, w) for s, w in saved], key=lambda x: -len(x[0]))
        # Prepend so custom shorthands take priority
        WORDS[:0] = custom
    except Exception as e:
        print(f"WARNING: Could not load shorthands: {e}")

def save_shorthands_to_file(new_entries):
    """Save new shorthand entries to the JSON file."""
    existing = []
    if os.path.exists(SHORTHANDS_FILE):
        try:
            with open(SHORTHANDS_FILE, 'r') as f:
                existing = json.load(f)
        except:
            existing = []

    existing_dict = {s: w for s, w in existing}
    for shorthand, word in new_entries:
        existing_dict[shorthand] = word

    with open(SHORTHANDS_FILE, 'w') as f:
        json.dump([[s, w] for s, w in existing_dict.items()], f, indent=2)
    print(f"  ✓ Saved to {SHORTHANDS_FILE}")


# ── Tokenizer & path expanders ───────────────────────────────────────────────
def tokenize_list(seg: str) -> list:
    """Greedily expand a shorthand segment into a list of full words."""
    result, s = [], seg
    while s:
        matched = False
        for short, full in WORDS:
            if s.startswith(short):
                result.append(full); s = s[len(short):]; matched = True; break
        if not matched:
            result.append(s[0]); s = s[1:]
    return result

def expand_dir(seg: str) -> str:
    """Directory segment → always lowercase, dash-joined."""
    return '-'.join(w.lower() for w in tokenize_list(seg))

def capitalize_base(seg: str, folder_ctx: str, ext: str = '') -> str:
    """
    Expand and capitalize a base name.
    pages/styles/.css → kebab lowercase
    All others: combined → PascalCase, dashed → kebab
    """
    is_lower = folder_ctx in ('pages', 'styles') or ext in ('.css', '.scss')
    if '-' in seg:
        return '-'.join((tokenize_list(p) or [p])[0].lower() for p in seg.split('-'))
    words = tokenize_list(seg)
    if len(words) > 1:
        return '-'.join(w.lower() for w in words) if is_lower else ''.join(w[0].upper() + w[1:] for w in words)
    word = words[0] if words else seg
    return word.lower() if is_lower else word

def expand_file(seg: str, folder_ctx: str) -> str:
    """Expand filename with correct capitalization and auto-extension."""
    if seg.startswith('['):
        return seg + FOLDER_EXT.get(folder_ctx, '')
    if '.' in seg:
        dot = seg.rfind('.'); base, ext = seg[:dot], seg[dot:]
        return capitalize_base(base, folder_ctx, ext) + ext
    if folder_ctx in FOLDER_EXT:
        return capitalize_base(seg, folder_ctx) + FOLDER_EXT[folder_ctx]
    if '-' in seg:
        return '-'.join((tokenize_list(p) or [p])[0].lower() for p in seg.split('-')) + '.ts'
    words = tokenize_list(seg)
    if len(words) > 1:
        return ''.join(w[0].upper() + w[1:] for w in words) + '.tsx'
    return words[0] if words else seg

def resolve_path(shorthand: str):
    """
    Resolve ../shorthand[..line] → (path, line_hint)
    Works for both files and directories.
    line_hint: int | (int, int) | None
    """
    line_hint = None
    m = re.search(r'\.\.(\d+)(?:-(\d+))?$', shorthand)
    if m:
        start = int(m.group(1)); end = int(m.group(2)) if m.group(2) else None
        line_hint = (start, end) if end else start
        shorthand = shorthand[:m.start()]

    s = shorthand
    while s.startswith('../') or s.startswith('./'):
        s = s[s.index('/') + 1:]

    parts = [p for p in s.split('/') if p]
    if not parts:
        print("ERROR: Empty path"); sys.exit(1)

    dir_parts  = [expand_dir(p) for p in parts[:-1]]
    folder_ctx = dir_parts[0] if dir_parts else ''
    last       = parts[-1]

    # Check if last part is a known directory shorthand (no file extension)
    expanded_last = expand_dir(last)
    candidate_dir = os.path.join(*dir_parts, expanded_last) if dir_parts else expanded_last
    if os.path.isdir(candidate_dir):
        return candidate_dir, line_hint

    file_seg = expand_file(last, folder_ctx)
    path     = os.path.join(*dir_parts, file_seg) if dir_parts else file_seg

    if os.path.exists(path):
        return path, line_hint
    if '.' not in os.path.basename(path):
        for ext in EXTENSIONS:
            if os.path.exists(path + ext):
                return path + ext, line_hint

    # Not found — return best guess
    # If the last segment looks like a directory shorthand, treat as dir
    if not FOLDER_EXT.get(folder_ctx) and '.' not in last:
        return candidate_dir, line_hint

    return path, line_hint

def build_import_stmt(path_shorthand: str) -> str:
    """Build a full import statement from a path shorthand like ../sty/wz"""
    s = path_shorthand
    while s.startswith('../') or s.startswith('./'):
        s = s[s.index('/') + 1:]

    parts = [p for p in s.split('/') if p]
    if not parts:
        print("ERROR: Empty import path"); sys.exit(1)

    folder_short = parts[0]
    folder_full  = expand_dir(folder_short)
    prefix       = IMPORT_PREFIX.get(folder_short, f'../{folder_full}/')
    file_seg     = expand_file(parts[-1], folder_full)
    full_path    = f"{prefix}{file_seg}"

    if file_seg.endswith('.css') or file_seg.endswith('.scss'):
        return f"import '{full_path}'"

    base    = os.path.splitext(os.path.basename(file_seg))[0]
    path_ne = f"{prefix}{os.path.splitext(file_seg)[0]}"
    ident   = base[0].upper() + base[1:] if base and base[0].islower() and folder_full not in ('styles', 'pages') else base
    return f"import {ident} from '{path_ne}'"


# ── File helpers ──────────────────────────────────────────────────────────────
def read_file(path: str) -> list:
    if not os.path.exists(path):
        print(f"ERROR: File not found → {path}"); sys.exit(1)
    with open(path, 'r') as f:
        return f.readlines()

def write_file(path: str, lines: list):
    with open(path, 'w') as f:
        f.writelines(lines)
    print(f"  ✓ Written: {path}")

def find_last_import_idx(lines: list) -> int:
    last = -1
    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            last = i
    return last

def req(val, msg):
    if not val:
        print(f"ERROR: {msg}"); sys.exit(1)


# ── Operations ────────────────────────────────────────────────────────────────
def op_find_empty(lines, hint=None):
    scope = [(i + 1, l) for i, l in enumerate(lines)]
    if isinstance(hint, tuple):
        scope = [(n, l) for n, l in scope if hint[0] <= n <= hint[1]]
    empty = [n for n, l in scope if l.strip() == '']
    print(f"  Empty lines: {', '.join(map(str, empty))}" if empty else "  No empty lines found.")

def op_find_colors(lines):
    """
    Scan entire file for any line containing a color property.
    Matches: color, background-color, border-color, text-color,
             fill, stroke, box-shadow, outline-color, caret-color, etc.
    Prints line number and the matched portion.
    """
    COLOR_PROPS = re.compile(
        r'(color|background-color|border-color|text-color|outline-color|'
        r'caret-color|fill|stroke|box-shadow|text-shadow|accent-color|'
        r'column-rule-color|flood-color|lighting-color|stop-color)\s*[:\s]',
        re.IGNORECASE
    )
    found = []
    for i, line in enumerate(lines):
        if COLOR_PROPS.search(line):
            found.append((i + 1, line.rstrip()))
    if found:
        print(f"  Color properties found on {len(found)} line(s):")
        for n, l in found:
            print(f"  {n:5d} | {l.strip()}")
    else:
        print("  No color properties found.")

def op_find_color_value(lines, color_val):
    """
    Scan entire file for a specific color value (hex, rgb, var, etc).
    e.g. color_val = '#ffffff' or 'var(--bg)' or 'rgba(0,0,0,0.5)'
    """
    found = []
    for i, line in enumerate(lines):
        if color_val.lower() in line.lower():
            found.append((i + 1, line.rstrip()))
    if found:
        print(f"  '{color_val}' found on {len(found)} line(s):")
        for n, l in found:
            print(f"  {n:5d} | {l.strip()}")
    else:
        print(f"  '{color_val}' not found in file.")

def op_wildcard_search(lines, pattern, range_hint=None, file_mode=False, filepath=None):
    """
    Wildcard search where & = any letter, # = any digit.
    Matches 1-7 chars of the wildcard type before the literal suffix.
    Returns (hits, total) where hits = list of (linenum, linetext, matches)
    file_mode=True  → only return count (for large file / directory use)
    file_mode=False → return all line numbers and matches
    """
    import re as _re

    # Build regex from pattern
    # & → [a-zA-Z]{1,7}   # → [0-9]{1,7}
    # Everything else is literal (escaped)
    regex_parts = []
    i = 0
    while i < len(pattern):
        ch = pattern[i]
        if ch == '&':
            regex_parts.append(r'[a-zA-Z]{1,7}')
        elif ch == '#':
            regex_parts.append(r'[0-9]{1,7}')
        else:
            regex_parts.append(_re.escape(ch))
        i += 1
    regex = _re.compile(''.join(regex_parts))

    hits = []
    for li, ln in enumerate(lines):
        lnum = li + 1
        if range_hint and not (range_hint[0] <= lnum <= range_hint[1]):
            continue
        matches = regex.findall(ln)
        if matches:
            hits.append((lnum, ln.rstrip(), matches))

    if file_mode:
        # Just count
        total = sum(len(h[2]) for h in hits)
        return hits, total
    else:
        return hits, sum(len(h[2]) for h in hits)


def op_find_on_line(lines, line_num, text):
    idx = line_num - 1
    if idx < 0 or idx >= len(lines):
        print(f"ERROR: Line {line_num} out of range (file has {len(lines)} lines)"); sys.exit(1)
    if text not in lines[idx]:
        print(f'ERROR: "{text}" not found on line {line_num}')
        print(f"  → {lines[idx].rstrip()}"); sys.exit(1)
    return idx

def op_put_after(lines, idx, match, content):
    lines[idx] = lines[idx].replace(match, match + content, 1)
    print(f"  Modified line {idx+1}: {lines[idx].rstrip()}"); return lines

def op_put_before(lines, idx, match, content):
    lines[idx] = lines[idx].replace(match, content + match, 1)
    print(f"  Modified line {idx+1}: {lines[idx].rstrip()}"); return lines

def op_put_replace(lines, idx, match, content):
    lines[idx] = lines[idx].replace(match, content, 1)
    print(f"  Modified line {idx+1}: {lines[idx].rstrip()}"); return lines

def op_add_to_line(lines, line_num, content):
    idx = line_num - 1
    if idx < 0 or idx >= len(lines):
        print(f"ERROR: Line {line_num} out of range"); sys.exit(1)
    if lines[idx].strip() != '':
        print(f"ERROR: Line {line_num} is not empty → {lines[idx].rstrip()}"); sys.exit(1)
    lines[idx] = content + '\n'
    print(f"  Added to line {line_num}: {content}"); return lines

def op_add_import(lines, path_shorthand):
    stmt = build_import_stmt(path_shorthand)
    idx  = find_last_import_idx(lines)
    lines.insert(idx + 1 if idx != -1 else 0, stmt + '\n')
    print(f"  Injecting: {stmt}"); return lines

def op_see(lines, range_str):
    if '-' in range_str:
        start, end = map(int, range_str.split('-'))
    else:
        start = end = int(range_str)
    end = min(end, len(lines))
    print(f"  Lines {start}–{end}:")
    for i in range(start, end + 1):
        print(f"  {i:5d} │ {lines[i-1].rstrip()}")

def op_delete(lines, text):
    for i, line in enumerate(lines):
        if text in line:
            print(f"  Deleting line {i+1}: {line.rstrip()}")
            del lines[i]; return lines
    print(f'WARNING: "{text}" not found — nothing deleted.'); return lines

def _parse_exact(token):
    """Strip ¿ boundary markers. ¿foo¿ -> ('foo', True). foo -> ('foo', False)."""
    if token.startswith('¿') and token.endswith('¿') and len(token) > 2:
        return token[1:-1], True
    return token, False


def op_replace_all(lines, search, replacement, exact=False, filepath=None):
    """Replace ALL occurrences of search text with replacement across all lines."""
    count = 0
    new_lines = []
    if exact:
        pattern = re.compile(r'(?<![a-zA-Z0-9\-])' + re.escape(search) + r'(?![a-zA-Z0-9\-])')
        for line in lines:
            new_line, n = pattern.subn(replacement, line)
            count += n
            new_lines.append(new_line)
    else:
        for line in lines:
            if search in line:
                count += line.count(search)
                new_lines.append(line.replace(search, replacement))
            else:
                new_lines.append(line)
    label = filepath or 'file'
    print(f'  ✓ {count} replacement(s) in {label}')
    return new_lines, count


def op_replace_all_in_dir(cur_dir, search, replacement, exact=False):
    """Replace ALL occurrences across all files in a directory recursively."""
    import glob as _glob
    matched_files = []
    for ext in EXTENSIONS:
        matched_files += _glob.glob(
            os.path.join(cur_dir, '**', f'*{ext}'),
            recursive=True
        )
    matched_files = sorted(set(matched_files))
    total = 0
    pattern = re.compile(r'(?<![a-zA-Z0-9\-])' + re.escape(search) + r'(?![a-zA-Z0-9\-])') if exact else None
    for fpath in matched_files:
        try:
            with open(fpath, 'r') as f:
                original = f.read()
        except:
            continue
        if exact:
            updated, count = pattern.subn(replacement, original)
        else:
            if search not in original:
                continue
            count = original.count(search)
            updated = original.replace(search, replacement)
        if count == 0:
            continue
        with open(fpath, 'w') as f:
            f.write(updated)
        rel = os.path.relpath(fpath, cur_dir)
        print(f'  ✓ {rel}: {count} replacement(s)')
        total += count
    print(f'  ─── {total} total replacement(s) across directory')


def op_create(base_dir, folder_name, file_name=None, file_ext=None):
    """
    Create a folder inside base_dir, and optionally a file inside it.
    Shorthands in folder_name and file_name are expanded automatically.
    """
    # Expand folder name through shorthands
    folder_expanded = expand_dir(folder_name)
    folder_path     = os.path.join(base_dir, folder_expanded)

    os.makedirs(folder_path, exist_ok=True)
    print(f"  ✓ Folder: {folder_path}/")

    if file_name and file_ext:
        # Determine folder context from base_dir name for capitalization
        parent_name = os.path.basename(base_dir)  # e.g. 'pages'
        file_base   = capitalize_base(file_name, parent_name)
        ext         = file_ext if file_ext.startswith('.') else '.' + file_ext
        file_path   = os.path.join(folder_path, file_base + ext)

        if os.path.exists(file_path):
            print(f"  Already exists: {file_path}")
        else:
            with open(file_path, 'w') as f:
                f.write('')
            print(f"  ✓ File: {file_path}")

    return folder_path

def op_add_shorthands(entries):
    """
    Add new shorthand entries to WORDS and persist them.
    entries: list of (shorthand, word) tuples
    """
    global WORDS
    for shorthand, word in entries:
        # Remove existing entry with same shorthand if present
        WORDS[:] = [(s, w) for s, w in WORDS if s != shorthand]
        # Insert at front sorted by length (longest first for tokenizer)
        insert_pos = 0
        for j, (s, _) in enumerate(WORDS):
            if len(s) <= len(shorthand):
                insert_pos = j
                break
        WORDS.insert(insert_pos, (shorthand, word))
        print(f"  ✓ Shorthand: {shorthand} → {word}")

    save_shorthands_to_file(entries)


# ── Command parser ────────────────────────────────────────────────────────────
def split_commands(cmd_str: str) -> list:
    """Split on ' > ' (space-arrow-space) into individual tokens."""
    return [t.strip() for t in cmd_str.split(' // ') if t.strip()]

def parse_token(token: str):
    """
    Parse a single token into (command, content).
    'go:../comp/intscr..432'     -> ('go',        '../comp/intscr..432')
    'find:background'            -> ('find',      'background')
    'put-after:-color: red;'     -> ('put-after', '-color: red;')
    'folder:file:tsx = rec:users'-> ('folder',    'file:tsx = rec:users')
    'short:recorder=rec & x=y'  -> ('short',     'recorder=rec & x=y')
    'add'                        -> ('add',        None)
    'imp../sty/wz'               -> ('imp',        '../sty/wz')
    'see:345-456'                -> ('see',        '345-456')
    """
    # imp has no > — path follows directly
    if re.match(r'^imp\.\./', token) or re.match(r'^imp\./', token):
        return ('imp', token[3:])

    # Bare quoted content (payload after add)
    if token.startswith('"') and token.endswith('"'):
        return (None, token[1:-1])

    # No > — standalone keyword
    if ':' not in token:
        return (token.lower(), None)

    cmd, content = token.split(':', 1)

    # Strip quotes from content if simple quoted string
    if content.startswith('"') and content.endswith('"'):
        content = content[1:-1]

    return (cmd.lower(), content)

def parse_folder_token(content: str):
    """
    Parse folder command content.
    'file>tsx = "recorder>users"' → (op='file', ext='tsx', folder='recorder', file='users')
    ' = "recorder"'              → (op=None,   ext=None, folder='recorder', file=None)
    """
    folder_name = None
    file_name   = None
    op          = None
    ext         = None

    if ' = ' in content:
        op_part, value_part = content.split(' = ', 1)
        op_part = op_part.strip()
        # Strip quotes from value
        value = value_part.strip().strip('"')

        # Parse names from value: "recorder:users" or "recorder"
        if ':' in value:
            folder_name, file_name = value.split(':', 1)
        else:
            folder_name = value

        # Parse operation: "file:tsx"
        if ':' in op_part:
            op, ext = op_part.split(':', 1)
        else:
            op = op_part

    else:
        # No = assignment — just a folder name in content
        folder_name = content.strip().strip('"')

    return op, ext, folder_name, file_name

def parse_short_token(content: str):
    """
    Parse short> content: 'recorder=rec & hand=hd & forest=frst'
    Returns list of (shorthand, word) tuples.
    Supports both 'word=sh' and 'sh=word' -- always stores (shorthand, word).
    Splits on '&' with or without surrounding spaces.
    """
    entries = []
    # Split on & with optional surrounding whitespace
    parts = [p.strip() for p in re.split(r'\s*&\s*', content) if p.strip()]
    for part in parts:
        if '=' not in part:
            print(f"WARNING: Skipping malformed shorthand entry: '{part}'")
            continue
        left, right = part.split('=', 1)
        left  = left.strip()
        right = right.strip()
        if not left or not right:
            print(f"WARNING: Skipping empty shorthand entry: '{part}'")
            continue
        # Convention: shorter token = shorthand, longer = word
        if len(left) <= len(right):
            shorthand, word = left, right
        else:
            shorthand, word = right, left
        entries.append((shorthand, word))
        print(f"  Parsed: {shorthand} → {word}")
    return entries


# ── Main executor ─────────────────────────────────────────────────────────────
def execute(cmd_str: str):
    tokens    = split_commands(cmd_str)
    cur_file  = None   # current target file path
    cur_dir   = None   # current target directory path
    cur_line  = None   # int or None
    cur_match = None   # text found via find>
    lines     = None
    modified  = False

    i = 0
    while i < len(tokens):
        cmd, content = parse_token(tokens[i])

        # ── go> ───────────────────────────────────────────────────────────────
        if cmd == 'go':
            target, lh = resolve_path(content)
            if os.path.isdir(target):
                cur_dir  = target
                cur_file = None
                lines    = None
                cur_line = None
                print(f"→ Directory: {target}/")
            else:
                cur_file = target
                cur_dir  = os.path.dirname(target) or '.'
                lines    = read_file(cur_file)
                cur_line = lh if not isinstance(lh, tuple) else None
                print(f"→ {cur_file}" + (f" (line {cur_line})" if cur_line else ""))
                if isinstance(lh, tuple):
                    # Range hint — used for find>empty
                    cur_line = lh  # store as tuple for find>empty scope

        # ── find ─────────────────────────────────────────────────────────────
        elif cmd == 'find':
            req(cur_file or cur_dir, "go: must come before find:")

            if content == 'empty' or content.startswith('empty..'):
                req(lines, "go: must point to a file for find:empty")
                hint = None
                if '..' in content:
                    rng = content.split('..', 1)[1]
                    s2, e2 = map(int, rng.split('-'))
                    hint = (s2, e2)
                elif isinstance(cur_line, tuple):
                    hint = cur_line
                op_find_empty(lines, hint)

            elif content == 'text-color':
                req(lines, "go: must point to a file for find:text-color")
                op_find_colors(lines)

            elif content.startswith('color:'):
                req(lines, "go: must point to a file for find:color:")
                color_val = content.split(':', 1)[1].strip()
                op_find_color_value(lines, color_val)

            else:
                # Parse optional line range suffix: find:text..1-400
                search_text = content
                range_hint  = None
                if '..' in content:
                    parts = content.split('..', 1)
                    search_text = parts[0]
                    rng_str     = parts[1]
                    if '-' in rng_str:
                        rs, re_ = map(int, rng_str.split('-', 1))
                        range_hint = (rs, re_)
                    else:
                        range_hint = (int(rng_str), int(rng_str))

                # ── Wildcard pattern detection ───────────────────────────────────
                is_wildcard = '&' in search_text or '#' in search_text

                # ── Directory search ──────────────────────────────────────────
                if cur_dir and not cur_file:
                    import glob as _glob
                    matched_files = []
                    for ext in EXTENSIONS:
                        matched_files += _glob.glob(
                            os.path.join(cur_dir, '**', f'*{ext}'),
                            recursive=True
                        )
                    matched_files = sorted(set(matched_files))
                    total = 0
                    for fpath in matched_files:
                        try:
                            with open(fpath, 'r') as f:
                                flines = f.readlines()
                        except:
                            continue
                        if is_wildcard:
                            hits, count = op_wildcard_search(flines, search_text, range_hint, file_mode=True, filepath=fpath)
                            if hits:
                                rel = os.path.relpath(fpath, cur_dir)
                                print(f'  {rel}: {count} instance(s)')
                                total += count
                        else:
                            hits = []
                            for li, ln in enumerate(flines):
                                lnum = li + 1
                                if range_hint and not (range_hint[0] <= lnum <= range_hint[1]):
                                    continue
                                if search_text in ln:
                                    hits.append((lnum, ln.rstrip()))
                            if hits:
                                rel = os.path.relpath(fpath, cur_dir)
                                print(f'  {rel}:')
                                for lnum, ln in hits:
                                    print(f'    {lnum:5d} │ {ln.strip()}')
                                total += len(hits)
                    print(f'  ─── {total} match(es) across directory')

                # ── Single file search ────────────────────────────────────────
                elif lines is not None:
                    if isinstance(cur_line, int) and range_hint is None:
                        cur_match = search_text
                        op_find_on_line(lines, cur_line, cur_match)
                        print(f'  Found "{cur_match}" on line {cur_line} ✓')
                    else:
                        if is_wildcard:
                            hits, total = op_wildcard_search(lines, search_text, range_hint, file_mode=False)
                            if hits:
                                print(f'  "{search_text}" matched {total} instance(s):')
                                for lnum, ln, matches in hits:
                                    print(f'  {lnum:5d} │ {ln.strip()}')
                                    print(f'         matches: {", ".join(set(matches))}')
                                cur_line  = hits[0][0]
                                cur_match = search_text
                            else:
                                scope = f'lines {range_hint[0]}–{range_hint[1]}' if range_hint else 'file'
                                print(f'  "{search_text}" not found in {scope}')
                        else:
                            hits = []
                            for li, ln in enumerate(lines):
                                lnum = li + 1
                                if range_hint and not (range_hint[0] <= lnum <= range_hint[1]):
                                    continue
                                if search_text in ln:
                                    hits.append((lnum, ln.rstrip()))
                            if hits:
                                print(f'  "{search_text}" found on {len(hits)} line(s):')
                                for lnum, ln in hits:
                                    print(f'  {lnum:5d} │ {ln.strip()}')
                                cur_line  = hits[0][0]
                                cur_match = search_text
                            else:
                                scope = f'lines {range_hint[0]}–{range_hint[1]}' if range_hint else 'file'
                                print(f'  "{search_text}" not found in {scope}')
                else:
                    print("ERROR: go: must point to a file or directory for find:")
                    sys.exit(1)

        # ── put-after> ────────────────────────────────────────────────────────
        elif cmd == 'put-after':
            req(cur_file, "go> must point to a file"); req(cur_match, "find> must come first")
            lines = op_put_after(lines, op_find_on_line(lines, cur_line, cur_match), cur_match, content)
            modified = True

        # ── put-before> ───────────────────────────────────────────────────────
        elif cmd == 'put-before':
            req(cur_file, "go> must point to a file"); req(cur_match, "find> must come first")
            lines = op_put_before(lines, op_find_on_line(lines, cur_line, cur_match), cur_match, content)
            modified = True

        # ── put-replace> ──────────────────────────────────────────────────────
        elif cmd == 'put-replace':
            req(cur_file, "go> must point to a file"); req(cur_match, "find> must come first")
            lines = op_put_replace(lines, op_find_on_line(lines, cur_line, cur_match), cur_match, content)
            modified = True

        # ── add ───────────────────────────────────────────────────────────────
        elif cmd == 'add':
            req(cur_file or cur_dir, "go> must come before add")
            req(i + 1 < len(tokens), 'add must be followed by imp../path or "content"')
            nt = tokens[i + 1]
            if re.match(r'^imp\.\./', nt):
                req(cur_file or cur_dir, "go> first")
                target_lines = lines if lines is not None else []
                if cur_file:
                    lines = op_add_import(lines, nt[3:])
                else:
                    print("ERROR: add > imp requires a file target, not a directory"); sys.exit(1)
            else:
                _, nc = parse_token(nt)
                req(cur_file, "go> must point to a file for add")
                req(isinstance(cur_line, int), "go> must include a line number for add")
                lines = op_add_to_line(lines, cur_line, nc)
            modified = True; i += 1

        # ── imp (standalone) ──────────────────────────────────────────────────
        elif cmd == 'imp':
            req(cur_file, "go> must point to a file for imp")
            lines = op_add_import(lines, content); modified = True

        # ── see> ──────────────────────────────────────────────────────────────
        elif cmd == 'see':
            req(cur_file, "go> must point to a file for see>")
            op_see(lines, content)

        # ── del> ──────────────────────────────────────────────────────────────
        elif cmd == 'del':
            req(cur_file, "go> must point to a file for del>")
            lines = op_delete(lines, content); modified = True

        # ── replace: -- replace all instances of last found text ─────────────
        elif cmd == 'replace':
            req(cur_file or cur_dir, "go: must come before replace:")
            req(cur_match or content, "replace: needs a search term (use find: first or replace:old=new)")

            # Support two syntaxes:
            # 1. find:foo // replace:bar   -- uses cur_match as search
            # 2. replace:foo=bar           -- inline search=replacement
            if cur_match and '=' not in content:
                raw_search, raw_replacement = cur_match, content
            elif '=' in content and not cur_match:
                raw_search, raw_replacement = content.split('=', 1)
            elif cur_match:
                raw_search, raw_replacement = cur_match, content
            else:
                parts = content.split('=', 1)
                raw_search, raw_replacement = parts[0], parts[1] if len(parts) > 1 else ''

            search,      exact_s = _parse_exact(raw_search)
            replacement, exact_r = _parse_exact(raw_replacement)
            exact = exact_s or exact_r
            if exact:
                print(f'  Exact-boundary mode: ¿{search}¿ → ¿{replacement}¿')

            if cur_dir and not cur_file:
                op_replace_all_in_dir(cur_dir, search, replacement, exact=exact)
            elif lines is not None:
                lines, _ = op_replace_all(lines, search, replacement, exact=exact, filepath=cur_file)
                modified = True
            else:
                print("ERROR: go: must point to a file or directory for replace:")
                sys.exit(1)

        # ── folder ───────────────────────────────────────────────────────────
        elif cmd == 'folder':
            base = cur_dir if cur_dir else (os.path.dirname(cur_file) if cur_file else '.')
            op, ext, folder_name, file_name = parse_folder_token(content)

            if not folder_name:
                print("ERROR: folder needs a name. Use folder = \"name\" or folder>file>tsx = \"folder>file\"")
                sys.exit(1)

            op_create(base, folder_name, file_name if op == 'file' else None, ext)
            # No file modification — don't set modified

        # ── short> ───────────────────────────────────────────────────────────
        elif cmd == 'short':
            entries = parse_short_token(content)
            if not entries:
                print("ERROR: No valid shorthand entries found."); sys.exit(1)
            op_add_shorthands(entries)

        # ── unknown ───────────────────────────────────────────────────────────
        elif cmd is not None:
            print(f"ERROR: Unknown command '{cmd}'")
            print("Available: go>  find>  put-after>  put-before>  put-replace>  add  imp../  see>  del>  folder  short>")
            sys.exit(1)

        i += 1

    if modified and cur_file and lines is not None:
        write_file(cur_file, lines)


# ── Entry point ───────────────────────────────────────────────────────────────
def main():
    # Load user-defined shorthands before anything else
    load_shorthands()

    if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'):
        print(__doc__); sys.exit(0)

    execute(' '.join(sys.argv[1:]))

if __name__ == '__main__':
    main()
