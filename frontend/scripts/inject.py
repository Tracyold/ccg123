#!/usr/bin/env python3
"""
inject.py -- Smart file injection script for Cutting Corners Gems
Usage: python3 scripts/inject.py 'go>../comp/intscr..432 > find>"background" > put-after>"-color: var(--bg);"'
"""

import sys, os, re

WORDS = [
('dtail','Detail'),   ('front','frontend'),  ('port', 'portfolio'),
('usrs', 'users'),    ('indx', 'index'),     ('comp', 'components'),
('inq',  'Inquiry'),  ('inv',  'Invoice'),   ('res',  'Results'),
('ord',  'Order'),    ('wid',  'Widget'),    ('mod',  'Modal'),
('acc',  'account'),  ('shp',  'shop'),      ('int',  'intro'),
('scr',  'screen'),   ('sty',  'styles'),    ('lib',  'lib'),
('hook', 'hooks'),    ('CP',   'ChatPanel'),  ('wiz',  'Wizard'),
('wz',   'wizard'),   ('pg',   'pages'),     ('fs',   'feasibility'),
('ck',   'check'),
]
FOLDER_EXT    = {'styles':'.css', 'pages':'.tsx'}
IMPORT_PREFIX = {'sty':'../styles/','comp':'../components/','lib':'../lib/','hook':'../hooks/','pg':'../pages/'}
EXTENSIONS    = ['.tsx','.ts','.jsx','.js','.css','.md']


def tokenize_list(seg):
result, s = [], seg
while s:
matched = False
for short, full in WORDS:
if s.startswith(short): result.append(full); s=s[len(short):]; matched=True; break
if not matched: result.append(s[0]); s=s[1:]
return result

def expand_dir(seg):
    return '-'.join(w.lower() for w in tokenize_list(seg))

def capitalize_base(seg, folder_ctx, ext=""):
    is_lower = folder_ctx in ('pages','styles') or ext in ('.css','.scss')
if '-' in seg:
    return '-'.join((tokenize_list(p)or[p])[0].lower() for p in seg.split('-'))
words = tokenize_list(seg)
if len(words)>1:
    return '-'.join(w.lower() for w in words) if is_lower else ''.join(w[0].upper()+w[1:] for w in words)
word = words[0] if words else seg
return word.lower() if is_lower else word

def expand_file(seg, folder_ctx):
    if seg.startswith('['): return seg + FOLDER_EXT.get: (folder_ctx
        if '.' in seg: dot=seg.rfind('.'); base,ext=seg[:dot],seg[dot:]
        return capitalize_base(base,folder_ctx,ext)+ext
            if folder_ctx in FOLDER_EXT: return capitalize_base(seg,folder_ctx)+FOLDER_EXT[folder_ctx]
                if '-' in seg:
                return '-'.join((tokenize_list(p)or[p])[0].lower() for p in seg.split('-'))+'.ts' words=tokenize_list(seg)
                    if len(words)>1: 
                    return ''.join(w[0].upper()+w[1:] for w in words)+'.tsx'
        return words[0] if words else seg

def resolve_path(shorthand):
line_hint = None
m = re.search(r'..(\d+)(?:-(\d+))?$', shorthand)
if m:
start=int(m.group(1)); end=int(m.group(2)) if m.group(2) else None
line_hint=(start,end) if end else start; shorthand=shorthand[:m.start()]
s=shorthand
while s.startswith('../') or s.startswith('./'): s=s[s.index('/')+1:]
parts=[p for p in s.split('/') if p]
if not parts: print("ERROR: Empty path"); sys.exit(1)
dir_parts=[expand_dir(p) for p in parts[:-1]]; folder_ctx=dir_parts[0] if dir_parts else ''
file_seg=expand_file(parts[-1],folder_ctx)
path=os.path.join(*dir_parts,file_seg) if dir_parts else file_seg
if os.path.exists(path): return path, line_hint
if '.' not in os.path.basename(path):
for ext in EXTENSIONS:
if os.path.exists(path+ext): return path+ext, line_hint
return path, line_hint

def build_import_stmt(path_shorthand):
s=path_shorthand
while s.startswith('../') or s.startswith('./'): s=s[s.index('/')+1:]
parts=[p for p in s.split('/') if p]
if not parts: print("ERROR: Empty import path"); sys.exit(1)
folder_short=parts[0]; folder_full=expand_dir(folder_short)
prefix=IMPORT_PREFIX.get(folder_short,f'../{folder_full}/')
file_seg=expand_file(parts[-1],folder_full); full_path=f"{prefix}{file_seg}"
if file_seg.endswith(('.css','.scss')): return f"import '{full_path}'"
base=os.path.splitext(os.path.basename(file_seg))[0]
path_ne=f"{prefix}{os.path.splitext(file_seg)[0]}"
ident=base[0].upper()+base[1:] if base and base[0].islower() and folder_full not in ('styles','pages') else base
return f"import {ident} from '{path_ne}'"

def read_file(path):
if not os.path.exists(path): print(f"ERROR: Not found → {path}"); sys.exit(1)
with open(path,'r') as f: return f.readlines()
def write_file(path,lines):
with open(path,'w') as f: f.writelines(lines)
print(f"✓ Written: {path}")
def find_last_import_idx(lines):
last=-1
for i,l in enumerate(lines):
if l.strip().startswith('import '): last=i
return last
def req(val, msg):
if not val: print(f"ERROR: {msg}"); sys.exit(1)

def op_find_empty(lines, hint=None):
scope = [(i+1,l) for i,l in enumerate(lines)]
if isinstance(hint,tuple): scope=[(n,l) for n,l in scope if hint[0]<=n<=hint[1]]
empty=[n for n,l in scope if l.strip()=='']
print(f"  Empty lines: {', '.join(map(str,empty))}" if empty else "  No empty lines found.")
def op_find_on_line(lines, line_num, text):
idx=line_num-1
if idx<0 or idx>=len(lines): print(f"ERROR: Line {line_num} out of range"); sys.exit(1)
if text not in lines[idx]:
print(f'ERROR: "{text}" not found on line {line_num}'); print(f"  → {lines[idx].rstrip()}"); sys.exit(1)
return idx
def op_put_after(lines,idx,match,content):
lines[idx]=lines[idx].replace(match,match+content,1)
print(f"  Modified {idx+1}: {lines[idx].rstrip()}"); return lines
def op_put_before(lines,idx,match,content):
lines[idx]=lines[idx].replace(match,content+match,1)
print(f"  Modified {idx+1}: {lines[idx].rstrip()}"); return lines
def op_put_replace(lines,idx,match,content):
lines[idx]=lines[idx].replace(match,content,1)
print(f"  Modified {idx+1}: {lines[idx].rstrip()}"); return lines
def op_add_to_line(lines,line_num,content):
idx=line_num-1
if idx<0 or idx>=len(lines): print(f"ERROR: Line {line_num} out of range"); sys.exit(1)
if lines[idx].strip()!='':
print(f"ERROR: Line {line_num} is not empty → {lines[idx].rstrip()}"); sys.exit(1)
lines[idx]=content+'\n'; print(f"  Added to line {line_num}: {content}"); return lines
def op_add_import(lines,path):
stmt=build_import_stmt(path); idx=find_last_import_idx(lines)
lines.insert(idx+1 if idx!=-1 else 0,stmt+'\n'); print(f"  Injecting: {stmt}"); return lines
def op_see(lines,range_str):
start,end=(map(int,range_str.split('-')) if '-' in range_str else (int(range_str),int(range_str)))
print(f"  Lines {start}–{min(end,len(lines))}:")
for i in range(start,min(end,len(lines))+1): print(f"  {i:5d} │ {lines[i-1].rstrip()}")
def op_delete(lines,text):
for i,l in enumerate(lines):
if text in l: print(f"  Deleting {i+1}: {l.rstrip()}"); del lines[i]; return lines
print(f'WARNING: "{text}" not found.'); return lines

def split_commands(s): return [t.strip() for t in s.split(' > ') if t.strip()]
def parse_token(token):
if re.match(r'^imp../',token): return ('imp',token[3:])
if token.startswith('"') and token.endswith('"'): return (None,token[1:-1])
if '>' not in token: return (token.lower(),None)
cmd,content=token.split('>',1)
if content.startswith('"') and content.endswith('"'): content=content[1:-1]
return (cmd.lower(),content)

def execute(cmd_str):
tokens=split_commands(cmd_str)
cur_file=None; cur_line=None; cur_match=None; lines=None; mod=False
i=0
while i<len(tokens):
cmd,content=parse_token(tokens[i])
if cmd=='go':
cur_file,lh=resolve_path(content); lines=read_file(cur_file)
cur_line=lh if not isinstance(lh,tuple) else None
print(f"→ {cur_file}"+(f" (line {cur_line})" if cur_line else ""))
elif cmd=='find':
req(cur_file,"go> must come before find>")
if content=='empty' or content.startswith('empty..'):
rng=None
if '..' in content:
s2,e2=map(int,content.split('..',1)[1].split('-')); rng=(s2,e2)
op_find_empty(lines,rng)
else:
req(cur_line,"go> needs a line number for find>")
cur_match=content; op_find_on_line(lines,cur_line,cur_match)
print(f'  Found "{cur_match}" on line {cur_line} ✓')
elif cmd=='put-after':
req(cur_file,"go> first"); req(cur_match,"find> first")
lines=op_put_after(lines,op_find_on_line(lines,cur_line,cur_match),cur_match,content); mod=True
elif cmd=='put-before':
req(cur_file,"go> first"); req(cur_match,"find> first")
lines=op_put_before(lines,op_find_on_line(lines,cur_line,cur_match),cur_match,content); mod=True
elif cmd=='put-replace':
req(cur_file,"go> first"); req(cur_match,"find> first")
lines=op_put_replace(lines,op_find_on_line(lines,cur_line,cur_match),cur_match,content); mod=True
elif cmd=='add':
req(cur_file,"go> first")
req(i+1<len(tokens),"add must be followed by imp../path or "content"")
nt=tokens[i+1]
if re.match(r'^imp../',nt): lines=op_add_import(lines,nt[3:])
else: req(cur_line,"go> needs line number for add"); _,nc=parse_token(nt); lines=op_add_to_line(lines,cur_line,nc)
mod=True; i+=1
elif cmd=='imp':
req(cur_file,"go> first"); lines=op_add_import(lines,content); mod=True
elif cmd=='see':
req(cur_file,"go> first"); op_see(lines,content)
elif cmd=='del':
req(cur_file,"go> first"); lines=op_delete(lines,content); mod=True
elif cmd is not None:
print(f"ERROR: Unknown command '{cmd}'"); sys.exit(1)
i+=1
if mod and cur_file and lines is not None: write_file(cur_file,lines)

def main():
if len(sys.argv)<2 or sys.argv[1] in ('-h','–help'): print(**doc**); sys.exit(0)
execute(' '.join(sys.argv[1:]))

if **name**=='**main**': main()