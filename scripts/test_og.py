import os
import re

sample_products = ['sfp-400g', 'mpo-cleaner', 'cwdm', 'easyget-wifi', 'uav-fiber-optic-spool']
for slug in sample_products:
    p_html = os.path.join(r'c:\Users\SEBIN\Desktop\PDR2\dist\products', slug, 'index.html')
    if os.path.exists(p_html):
        with open(p_html, 'r', encoding='utf-8') as f:
            html = f.read()
            m_title = re.search(r'<meta property="og:title" content="([^"]+)"', html)
            m_url = re.search(r'<meta property="og:url" content="([^"]+)"', html)
            m_can = re.search(r'<link rel="canonical" href="([^"]+)"', html)
            t_val = m_title.group(1) if m_title else 'MISSING'
            u_val = m_url.group(1) if m_url else 'MISSING'
            c_val = m_can.group(1) if m_can else 'MISSING'
            
            cond1 = slug in u_val
            cond2 = 'pdrworld.com' in u_val
            cond3 = (u_val == c_val)
            print(f'SLUG: {slug}')
            print(f'  og:title:   {t_val}')
            print(f'  og:url:     {u_val}')
            print(f'  canonical:  {c_val}')
            print(f'  cond1 (slug in u_val): {cond1}, cond2 (pdrworld in u_val): {cond2}, cond3 (u_val == c_val): {cond3}')
