let specCount = 1;
const specList = document.querySelector(".spec-list");

specList.addEventListener("click", (e) => {
  e.preventDefault();
  
  if (e.target.id === "add-spec") {
    const currSpecDivClassname = e.target.parentElement.className
    const currCount = parseInt(currSpecDivClassname.replace('spec', ''))
    specCount = (currCount === specCount) ? specCount : currCount

    const previousSpecDiv = document.querySelector(`.spec${specCount}`);
    const previousAddSpecBtn = document.getElementById(`add-spec`);
    previousSpecDiv.removeChild(previousAddSpecBtn);

    ++specCount;
    const specInput = document.createElement("div");
    specInput.className = `spec${specCount}`;

    const input = document.createElement("input");
    input.id = `spec${specCount}`;
    input.type = "text";
    input.name = `spec${specCount}`;
    input.placeholder = `Specification #${specCount}`;

    const insertSpec = document.createElement("button");
    insertSpec.textContent = "+Add specification";
    insertSpec.id = `add-spec`;

    specInput.append(input, insertSpec);
    specList.append(specInput);
  }
});
