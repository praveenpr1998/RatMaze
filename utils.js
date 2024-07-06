function getElementsByIds(ids) {
  const elements = {};
  ids.forEach((id) => {
    elements[id] = document.getElementById(id);
  });
  return elements;
}

const getRandomNumber = (max) => Math.floor(Math.random() * max);

function manageClasses(actions) {
  actions.forEach(({ element, addClasses = [], removeClasses = [] }) => {
    if (element) {
      addClasses.forEach((className) => element.classList.add(className));
      removeClasses.forEach((className) => element.classList.remove(className));
    }
  });
}

const TEXT_CONSTANTS = {
  START: "S",
  END: "E",
  LOST_MESSAGE: "Uh oh! The rat is lost",
  WON_MESSAGE: "Victory! The rat found the way!",
};
