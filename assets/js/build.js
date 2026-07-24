var build_hash = "122323323";
function loadScripts(scripts = []) {
  scripts.forEach((src) => {
    const script = document.createElement("script");
    script.src = `${src.path}?t=${build_hash}`;
    if (src.type) {
      script.type = src.type;
    }
    document.body.appendChild(script);
  });
}
