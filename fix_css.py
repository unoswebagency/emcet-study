with open("e:\\emcet\\eapcet-study-app.css", "r", encoding="utf-8") as f:
    css = f.read()

target1 = ".top, .layout { opacity: 0; transform: translateY(10px); transition: opacity 0.8s ease, transform 0.8s ease; }"
target2 = "body.loaded .top, body.loaded .layout { opacity: 1; transform: translateY(0); }"

replace = """.top, .content { opacity: 0; transform: translateY(10px); transition: opacity 0.8s ease, transform 0.8s ease; }
body.loaded .top, body.loaded .content { opacity: 1; transform: translateY(0); }

@media(min-width: 901px) {
  .sidebar { opacity: 0; transform: translateY(10px); transition: opacity 0.8s ease, transform 0.8s ease; }
  body.loaded .sidebar { opacity: 1; transform: translateY(0); }
}"""

css_lines = css.split("\n")

for i in range(len(css_lines) - 1):
    if target1 in css_lines[i] and target2 in css_lines[i+1]:
        css_lines[i] = replace
        css_lines[i+1] = ""
        break

with open("e:\\emcet\\eapcet-study-app.css", "w", encoding="utf-8") as f:
    f.write("\n".join(css_lines))
