import interact from "https://cdn.interactjs.io/v1.10.11/interactjs/index.js";
import "https://code.jquery.com/jquery-3.6.0.min.js";
import LeaderLine from "/leader-line.min.js";

// --- fade.js ---

if (window.matchMedia("(pointer: fine)").matches) {
  $(".cuatrimestre > *").mouseenter(highlight);
  $(".cuatrimestre > *").mouseleave(defaultView);
} else {
  $(".cuatrimestre > *").click(touchScreen);
}

function touchScreen(e) {
  if ($(".famous").length) defaultView(e);
  else highlight(e);
}

function highlight(e) {
  // If someone is already being highlighted, return
  if ($(".famous").length) return;
  
  const dependecies = [
    e.currentTarget.id,
    ...getAllParents([e.currentTarget.id]),
  ];

  $(`.cuatrimestre > *:not(#${dependecies.join("):not(#")}):not(.${e.currentTarget.id})`).addClass("hide");
  $(`#${dependecies.join(", #")}`).addClass("show");
  $(`#${e.currentTarget.id}`).addClass("famous");

  // Update lines (just in case) and show them
  lines[e.currentTarget.id]?.forEach((l) => l.position().show("draw"));
}

function getAllParents(ids) {
  const dependecies = [];

  for (let id of ids) {
    if (!id) continue; // Idk why, _sometimes_ it happens, specially if dragging the object
    const parents = document.querySelector(`#${id}`).classList;
    if (parents.length) dependecies.push(...parents, ...getAllParents(parents));
  }

  return dependecies;
}

function defaultView(e) {
  // If no elements are being highlighted, return
  if (!$(".famous").length) return;
  $("*").removeClass("hide").removeClass("show").removeClass("famous");
  Object.values(lines).flat().forEach(l => l.hide("draw"));
}

// --- drag.js ---

// target all dragable elements
interact(".cuatrimestre > div")
  .draggable({
    inertia: true,
    autoScroll: false,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: document.body,
        endOnly: true,
      }),
    ],
    listeners: {
      move: dragMoveListener,
    },
  });

function dragMoveListener(event) {
  let target = event.target;
  // keep the dragged position in the data-x/data-y attributes
  let x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
  let y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

  // translate the element
  target.style.transform = "translate(" + x + "px, " + y + "px)";

  // update the posiion attributes
  target.setAttribute("data-x", x);
  target.setAttribute("data-y", y);

  // Make the arrow follow the box
  lines[target.id]?.forEach((line) => line.position());
}

// --- arrows.js ---

const lines = {};
document.querySelectorAll(".cuatrimestre > div").forEach(el => {
  document.querySelectorAll(`.${el.id}`).forEach(target => {
    if (!lines[el.id]) lines[el.id] = [];
    lines[el.id].push(
      new LeaderLine(el, target, {
        dash: { animation: true },
        path: "magnet",
        hide: true,
      })
    );
  });
});
