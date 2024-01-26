async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); 
}







console.log("script is working")
sendbutton.addEventListener("click", async ()=>{
    
    questionInput = document.getElementById("questionInput").value;
    document.getElementById("questionInput").value="";
    document.querySelector(".right2").style.display="block";
    document.querySelector(".right1").style.display="none";
    question1.innerHTML=questionInput;
    question2.innerHTML=questionInput;
    let result=await postData("/api",{"question":questionInput});
    solution.innerHTML= result.result;
})