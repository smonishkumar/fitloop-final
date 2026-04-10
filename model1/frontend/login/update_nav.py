import os
import re

files = ["index.html", "how-it-works.html", "testimonials.html", "steps.html"]
nav_links_html = """
<a class="text-on-surface-variant dark:text-slate-400 hover:text-emerald-700 transition-colors duration-300" href="/index.html">Login</a>
<a class="text-on-surface-variant dark:text-slate-400 hover:text-emerald-700 transition-colors duration-300" href="/how-it-works.html">How it works</a>
<a class="text-on-surface-variant dark:text-slate-400 hover:text-emerald-700 transition-colors duration-300" href="/testimonials.html">Testimonials</a>
<a class="text-on-surface-variant dark:text-slate-400 hover:text-emerald-700 transition-colors duration-300" href="/steps.html">Steps</a>
"""

for file in files:
    if os.path.exists(file):
        with open(file, 'r') as f:
            content = f.read()
            
        pattern = re.compile(r'(<div class="hidden md:flex items-center space-x-8 font-\[\'Inter\'\] tracking-tight font-medium text-sm">).*?(</div>)', re.DOTALL)
        new_content = pattern.sub(r'\1' + nav_links_html + r'\2', content)
        
        # Also update logo link to point to index.html
        pattern2 = re.compile(r'(<div class="text-xl font-bold tracking-tighter text-on-surface dark:text-white">)(FitLoop)(</div>)', re.DOTALL)
        new_content = pattern2.sub(r'\1<a href="/index.html">\2</a>\3', new_content)
        
        with open(file, 'w') as f:
            f.write(new_content)
print("Updated navs")
