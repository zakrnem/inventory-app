const specList = document.querySelector(".spec-list");
const specsArray = [...specList.children];
let specCount = specsArray.length > 2 ? specsArray.length - 1 : 1;

specList.addEventListener("click", (e) => {
  e.preventDefault();

  if (e.target.id === "add-spec") {
    const prevAddSpecBtn = document.getElementById("add-spec");
    const prevInput = document.getElementById(`spec${specCount}`);
    const errorsDiv = document.querySelector(".errors");
    let prevErrorMsg = document.querySelector("#empty-spec-error");

    if (prevInput.value !== "") {
      prevInput.style.border = "";
      if (prevErrorMsg) errorsDiv.removeChild(prevErrorMsg);
      specList.removeChild(prevAddSpecBtn);

      specCount++;
      const input = document.createElement("input");
      input.id = `spec${specCount}`;
      input.type = "text";
      input.name = `specification`;
      input.placeholder = `Specification #${specCount}`;

      const insertSpec = document.createElement("button");
      insertSpec.textContent = "+Add specification";
      insertSpec.id = `add-spec`;

      specList.append(input, insertSpec);
    } else {
      let errorMsg = document.createElement("p");
      errorMsg.id = "empty-spec-error";
      errorMsg.textContent =
        "Please fill in the current specification before adding another.";

      if (!prevErrorMsg) {
        errorsDiv.append(errorMsg);
        prevInput.style.border = "solid 2px red";
      }
    }
  }
});
