window.onload = function() {
    viewSurvey(); // 调用 viewSurvey 函数以显示问卷数据
};

function viewSurvey() {
    const blockDiv = document.getElementById('SurveyContent');
    blockDiv.style.display = 'block'; // 将 display 属性设置为 'block' 以显示该元素
    const surveyData = JSON.parse(localStorage.getItem('surveyData')); // 从 localStorage 获取问卷数据
    const surveyDisplay = document.getElementById('SurveyDisplay');
    const inputElement = document.querySelector('.input1'); // 获取 input 元素

    surveyDisplay.innerHTML = ''; // 清空之前的内容

    if (surveyData) {
        inputElement.value = surveyData.title;
        
        surveyData.questions.forEach((q, index) => {
            let questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            
            questionDiv.innerHTML = `
                <p>${index + 1}. <strong>${q.question}</strong></p>
            `;
            
            if (q.type === 'text') {
                questionDiv.innerHTML += `
                    <textarea class="length" rows="1" cols="50" name="question${index + 1}" placeholder="你的看法..." disabled></textarea>
                    <br><label>
                        <input type="checkbox" class="necessary" ${q.isRequired ? 'checked' : ''} disabled/> 此题是否必填
                    </label>
                `;
            } else {
                q.options.forEach((opt, idx) => {
                    // 生成选项字母（A, B, C, D）
                    const optionLetter = String.fromCharCode(65 + idx);
                    
                    // 添加选项到问题div
                    questionDiv.innerHTML += `
                        <div class="answer">
                            <input 
                                type="${q.type}" 
                                name="question${index + 1}" 
                                id="q${index + 1}opt${idx}" 
                                value="${optionLetter}"
                                disabled
                            >
                            <label for="q${index + 1}opt${idx}">
                                ${optionLetter}. ${opt.text}
                            </label>
                        </div>
                    `;
                });
            }
            questionDiv.innerHTML += '</div>';
            surveyDisplay.appendChild(questionDiv);
        });
    } else {
        surveyDisplay.innerHTML = '<p>没有找到问卷数据！</p>';
        inputElement.value = '';
        inputElement.placeholder = '没有问卷可查看';
    }
}


function ret(){
    window.location.href ="../1-首页（问卷列表）/1-首页（问卷列表）.html";
}