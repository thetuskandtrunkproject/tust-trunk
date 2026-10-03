import os

files = [
    'frontend/src/routes/shop.tsx',
    'frontend/src/routes/wishlist.tsx',
    'frontend/src/components/site/product-carousel.tsx',
    'frontend/src/routes/products.$slug.tsx',
]

for f in files:
    with open(f, 'r') as fp:
        lines = fp.readlines()
    
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('<<<<<<< HEAD'):
            # skip until =======
            while i < len(lines) and not lines[i].startswith('======='):
                i += 1
            i += 1 # skip =======
            # keep everything until >>>>>>>
            while i < len(lines) and not lines[i].startswith('>>>>>>>'):
                out.append(lines[i])
                i += 1
            i += 1 # skip >>>>>>>
        else:
            out.append(line)
            i += 1
            
    with open(f, 'w') as fp:
        fp.writelines(out)
