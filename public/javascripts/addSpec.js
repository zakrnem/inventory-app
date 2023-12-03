let specCount = 1;
const specList = document.querySelector(".spec-list");

specList.addEventListener("click", (e) => {
  e.preventDefault();

  if (e.target.id === "add-spec") {
    const prevAddSpecBtn = document.getElementById(`add-spec`);
    specList.removeChild(prevAddSpecBtn);

    ++specCount;
    const input = document.createElement("input");
    input.id = `spec${specCount}`;
    input.type = "text";
    input.name = `specification`;
    input.placeholder = `Specification #${specCount}`;

    const insertSpec = document.createElement("button");
    insertSpec.textContent = "+Add specification";
    insertSpec.id = `add-spec`;

    specList.append(input, insertSpec);
  }
});
