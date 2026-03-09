export function createAppShell(): HTMLElement {
  const shell = document.createElement("main");
  shell.className = "app-shell";

  shell.innerHTML = `
    <section class="hero">
      <p class="eyebrow">Ray2</p>
      <h1>Viewer workspace is ready for renderer integration.</h1>
      <p class="description">
        Task 1 scaffolding is in place. The next steps are the neutral scene
        contracts and adapter packages.
      </p>
    </section>
  `;

  return shell;
}
