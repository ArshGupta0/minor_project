let pdfText = '';
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



summarizeButton.addEventListener("click", async () => {
  document.querySelector(".right2").style.display="block";
  document.querySelector(".right1").style.display="none";
  document.querySelector(".pdff").style.display="block";
  question1.innerHTML="Summary:-";
  const fileInput = document.getElementById("pdfFile");
  const file = fileInput.files[0];

  if (!file) {
      alert('Please select a PDF file.');
      return;
  }

  const reader = new FileReader();
  reader.onload = async function(event) {
      const typedarray = new Uint8Array(event.target.result);

      try {
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          
          const numPages = pdf.numPages;
          for (let i = 1; i <= numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              textContent.items.forEach(function(item) {
                  pdfText += item.str + ' ';
              });
          }

          pdfText = "Summarize this:- (answer should not be more than 1450 characters)" + pdfText;
          const result = await postData("/api", { "question": pdfText , "name": file.name});

          formatSolution(result.result);
          console.log(result);
          question2.innerHTML = `File Name: ${file.name}`;
          

      } catch (error) {
          console.error('Error loading PDF:', error);
      }
  };
  reader.readAsArrayBuffer(file);
});
function formatSolution(solutionText) {
    // Assuming 'solution' is the DOM element where you want to display the solution
    const solutionElement = document.getElementById('solution');

    // Split the solution text into points or lines
    const points = solutionText.split('\n');

    // Create a paragraph element to hold the solution
    const paragraphElement = document.createElement('p');

    // Iterate over the points and create separate lines
    points.forEach(point => {
        const lineElement = document.createElement('div');
        lineElement.textContent = point;
        paragraphElement.appendChild(lineElement);
    });

    // Clear the existing content and append the formatted solution
    solutionElement.innerHTML = '';
    solutionElement.appendChild(paragraphElement);
}
const sendButton = document.getElementById("sendbutton");
const loadingOverlay = document.getElementById("loadingOverlay");

sendbutton.addEventListener("click", async () => {
    // Set loading message for question and solution
    loadingOverlay.style.display = "flex";

    // Get the input question value and clear the input field
    const questionInput = document.getElementById("questionInput").value;
    document.getElementById("questionInput").value = "";

    // Send the question to the server and await the result
    let result = await postData("/api-1", {"question": pdfText + ' ' + questionInput});

    // Create a new div to contain the question and answer
    const newQuestionAnswerDiv = document.createElement("div");
    newQuestionAnswerDiv.classList.add("question-answer");

    // Add the question to the new div
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");
    questionDiv.textContent = questionInput;
    newQuestionAnswerDiv.appendChild(questionDiv);

    // Add the answer typing effect to the new div
    const answerDiv = document.createElement("div");
    answerDiv.classList.add("answer");
    newQuestionAnswerDiv.appendChild(answerDiv);
    
    // Append the new div below existing question-answer divs
    const right2Div = document.querySelector(".right2");
    right2Div.appendChild(newQuestionAnswerDiv);
    loadingOverlay.style.display = "none";

    // Simulate typing effect for the answer
    await typeEffect(answerDiv, result.result);
});

// Typing effect function
// Typing effect function
async function typeEffect(element, text) {
    for (let i = 0; i < text.length; i++) {
        await sleep(5); // Adjust typing speed here (milliseconds)
        const char = text[i];

        // Apply different styling based on the character being typed
        const span = document.createElement("span");
        span.textContent = char;
        if (char === '\n') {
            span.classList.add("block", "text-gray-600"); // Example Tailwind CSS classes for line break and text color
        } else {
            span.classList.add("text-gray-800"); // Example Tailwind CSS class for text color
        }

        // Append the character to the answer div
        element.appendChild(span);
        element.parentElement.parentElement.scrollTop = element.parentElement.parentElement.scrollHeight; // Auto-scroll
    }
}


// Utility function for sleep (pause execution)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


document.getElementById('pdfFile').addEventListener('change', function(event) {
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function() {
        var typedarray = new Uint8Array(this.result);
        displayPDF(typedarray);
    };

    reader.readAsArrayBuffer(file);
});

function displayPDF(pdfData) {
    // Create a Blob from the PDF data
    var blob = new Blob([pdfData], { type: 'application/pdf' });

    // Generate a URL for the Blob
    var url = URL.createObjectURL(blob);

    // Get the iframe element
    var iframe = document.getElementById('pdfViewer');

    // Set the src attribute of the iframe to the PDF URL
    iframe.src = url;
}


