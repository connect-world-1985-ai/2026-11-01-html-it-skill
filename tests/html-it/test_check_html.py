"""Tests for skills/html-it/scripts/check_html.py (standard library only).

Run: python -m unittest discover -s tests/html-it -v
"""
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "skills", "html-it", "scripts"))

import check_html  # noqa: E402

HEAD = (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width, initial-scale=1">'
    "<title>Login timeout review</title>{extra_head}</head><body>{body}</body></html>"
)


def page(body="", extra_head=""):
    return HEAD.format(body=body, extra_head=extra_head)


def run(html, **kw):
    return check_html.check(html, **kw)


class StructureTests(unittest.TestCase):
    def test_minimal_valid_page_passes(self):
        r = run(page("<main><h1>Review</h1><p>All good.</p></main>"))
        self.assertEqual(r.failures, [], r.failures)

    def test_missing_lang_fails(self):
        html = page("<p>x</p>").replace(' lang="en"', "")
        self.assertTrue(any("lang" in f for f in run(html).failures))

    def test_missing_title_fails(self):
        html = page("<p>x</p>").replace("<title>Login timeout review</title>", "")
        self.assertTrue(any("title" in f for f in run(html).failures))

    def test_missing_doctype_fails(self):
        html = page("<p>x</p>").replace("<!doctype html>", "")
        self.assertTrue(any("doctype" in f for f in run(html).failures))

    def test_img_without_alt_fails(self):
        r = run(page('<img src="data:image/png;base64,AAAA">'))
        self.assertTrue(any("alt" in f for f in r.failures))

    def test_img_with_empty_alt_passes(self):
        r = run(page('<img src="data:image/png;base64,AAAA" alt="">'))
        self.assertEqual(r.failures, [])


class NetworkTests(unittest.TestCase):
    def assertNetworkFail(self, html):
        fails = run(html).failures
        self.assertTrue(any("network" in f for f in fails), fails)

    def test_external_script_fails(self):
        self.assertNetworkFail(page('<script src="https://cdn.jsdelivr.net/npm/x@1/x.js"></script>'))

    def test_protocol_relative_script_fails(self):
        self.assertNetworkFail(page('<script src="//cdnjs.cloudflare.com/x.js"></script>'))

    def test_external_stylesheet_fails(self):
        self.assertNetworkFail(page("", '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">'))

    def test_css_import_fails(self):
        self.assertNetworkFail(page("", "<style>@import url('https://fonts.googleapis.com/x');</style>"))

    def test_css_url_fails(self):
        self.assertNetworkFail(page('<div style="background:url(https://example.com/a.png)"></div>'))

    def test_fetch_fails(self):
        self.assertNetworkFail(page("<script>fetch('https://api.example.com/data')</script>"))

    def test_external_img_fails(self):
        self.assertNetworkFail(page('<img src="https://example.com/a.png" alt="a">'))

    def test_svg_use_external_fails(self):
        self.assertNetworkFail(page('<svg><use href="https://example.com/s.svg#i"></use></svg>'))

    def test_xhr_open_fails(self):
        self.assertNetworkFail(page("<script>x.open('GET', 'https://api.example.com/d')</script>"))

    def test_window_open_is_allowed(self):
        r = run(page("<script>btn.onclick = () => window.open('https://example.com')</script>"))
        self.assertEqual(r.failures, [])

    def test_runtime_src_assignment_fails(self):
        self.assertNetworkFail(page("<script>s.src = 'https://cdn.jsdelivr.net/npm/x@1/x.js'</script>"))

    def test_runtime_set_attribute_src_fails(self):
        self.assertNetworkFail(page("<script>i.setAttribute('src', 'https://example.com/a.png')</script>"))

    def test_location_href_is_allowed(self):
        r = run(page("<script>go.onclick = () => { location.href = 'https://example.com'; }</script>"))
        self.assertEqual(r.failures, [])

    def test_srcdoc_with_external_font_fails(self):
        sketch = ('&lt;link rel=&quot;stylesheet&quot; href=&quot;https://fonts.googleapis.com/css2?'
                  'family=Inter&quot;&gt;&lt;p&gt;Home&lt;/p&gt;')
        fails = run(page(f'<iframe title="Home sketch" srcdoc="{sketch}"></iframe>')).failures
        self.assertTrue(any("srcdoc" in f and "network" in f for f in fails), fails)

    def test_srcdoc_self_contained_passes(self):
        sketch = "&lt;style&gt;p{color:red}&lt;/style&gt;&lt;p&gt;Home&lt;/p&gt;"
        r = run(page(f'<iframe title="Home sketch" srcdoc="{sketch}"></iframe>'))
        self.assertEqual(r.failures, [])

    def test_clickable_link_is_allowed(self):
        r = run(page('<a href="https://github.com/anthropics/html-effectiveness">gallery</a>'))
        self.assertEqual(r.failures, [])

    def test_data_uri_is_allowed(self):
        r = run(page('<img src="data:image/svg+xml;base64,PHN2Zz4=" alt="icon">'))
        self.assertEqual(r.failures, [])


class ReferenceTests(unittest.TestCase):
    def test_bare_id_without_entry_fails(self):
        r = run(page("<p>See F001 for details.</p>"))
        self.assertTrue(any("F001" in f for f in r.failures), r.failures)

    def test_chip_with_entry_passes(self):
        body = (
            '<p>See <a class="ref" data-ref="F001" href="#ref-F001">'
            '<span class="ref-id">F001</span> login timeout</a>.</p>'
            '<section id="references"><ol><li id="ref-F001"><b>F001</b> Login '
            "timeout finding from the review of PR 42.</li></ol></section>"
        )
        r = run(page(body))
        self.assertEqual(r.failures, [], r.failures)

    def test_chip_without_entry_fails(self):
        body = '<a class="ref" data-ref="F002" href="#ref-F002"><span class="ref-id">F002</span> x</a>'
        r = run(page(body))
        self.assertTrue(any("F002" in f for f in r.failures))

    def test_unresolved_chip_is_warning_not_failure(self):
        body = '<span class="ref" data-ref="ABC-123" data-ref-status="unresolved"><span class="ref-id">ABC-123</span> not found</span>'
        r = run(page(body))
        self.assertEqual(r.failures, [])
        self.assertTrue(any("ABC-123" in w for w in r.warnings))

    def test_bare_mention_of_resolved_id_is_warning(self):
        body = '<p>F001 again.</p><ol><li id="ref-F001">F001 Login timeout.</li></ol>'
        r = run(page(body))
        self.assertEqual(r.failures, [])
        self.assertTrue(any("F001" in w for w in r.warnings))

    def test_id_inside_code_is_ignored(self):
        r = run(page("<p>Run <code>make F001</code> and see <pre>ERR-404</pre></p>"))
        self.assertEqual(r.failures, [])

    def test_compound_ids_are_matched_whole(self):
        fails = run(page("<p>Code BK-2026-0042 was cut in R26.11.</p>")).failures
        self.assertTrue(any("BK-2026-0042" in f for f in fails), fails)
        self.assertTrue(any("R26.11" in f for f in fails), fails)

    def test_compound_id_chip_with_entry_passes(self):
        body = ('<a class="ref" data-ref="BK-2026-0042" href="#ref-BK-2026-0042">'
                '<span class="ref-id">BK-2026-0042</span> booking code</a>'
                '<ol><li id="ref-BK-2026-0042">Example booking confirmation code.</li></ol>')
        self.assertEqual(run(page(body)).failures, [])

    def test_sentence_end_is_not_part_of_id(self):
        fails = run(page("<p>See F001.</p>")).failures
        self.assertTrue(any("bare F001 " in f for f in fails), fails)

    def test_allow_meta_skips_ids(self):
        extra = '<meta name="html-it:allow-ids" content="ISO-8601, ES2020">'
        r = run(page("<p>Dates use ISO-8601 and code targets ES2020.</p>", extra))
        self.assertEqual(r.failures, [])

    def test_allow_argument_skips_ids(self):
        r = run(page("<p>Encoded as H264.</p>"), allow=["H264"])
        self.assertEqual(r.failures, [])


class SizeTests(unittest.TestCase):
    def test_large_file_warns(self):
        r = run(page("<p>x</p>"), size_bytes=25 * 1024 * 1024, max_mb=20)
        self.assertTrue(any("MB" in w for w in r.warnings))


if __name__ == "__main__":
    unittest.main()
