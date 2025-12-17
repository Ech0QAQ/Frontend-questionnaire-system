window.onload = function() {
    viewSurvey(); // 调用 viewSurvey 函数以显示问卷数据
};

function viewSurvey() {
    const blockDiv = document.getElementById('SurveyContent');
    blockDiv.style.display = 'block';
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));
    const surveyDisplay = document.getElementById('SurveyDisplay');
    const inputElement = document.querySelector('.input1');

    surveyDisplay.innerHTML = '';

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
                    <textarea class="length" rows="1" cols="50" name="question${index + 1}" placeholder="你的看法..."></textarea>
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


function sub() {
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));
    let allFilled = true;
    const errorMessage = '还有必填字段未填写';

    if (surveyData) {
        surveyData.questions.forEach((q, index) => {
            const questionElements = document.getElementsByName('question' + (index + 1));
            
            if (q.type === 'text') {
                if (q.isRequired) {
                    const textAnswer = questionElements[0].value.trim();
                    if (!textAnswer) {
                        allFilled = false;
                        return;
                    }
                }
            } else {
                const selectedOption = Array.from(questionElements).some(input => input.checked);
                if (!selectedOption) {
                    allFilled = false;
                    return;
                }
            }
        });
    }

    if (allFilled) {
        saveSurveyResponse(); // 保存答卷数据
        alert('提交成功');
        window.location.href = '../1-首页（问卷列表）/1-首页（问卷列表）.html';
        return;
    }
    alert(errorMessage);
}

function saveSurveyResponse() {
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));
    if (!surveyData) return;

    // 创建答卷数据对象
    const responseData = {
        surveyId: surveyData.id, // 问卷的唯一标识符
        surveyTitle: surveyData.title,
        submitTime: new Date().toLocaleString(), // 提交时间
        answers: []
    };

    // 收集每个问题的答案
    surveyData.questions.forEach((q, index) => {
        const questionElements = document.getElementsByName('question' + (index + 1));
        let answer = {
            questionIndex: index,
            questionText: q.question,
            type: q.type
        };

        if (q.type === 'text') {
            // 收集文本题答案
            answer.response = questionElements[0].value.trim();
        } else {
            // 收集单选或多选题答案
            answer.response = Array.from(questionElements)
                .filter(input => input.checked)
                .map(input => input.value);
        }

        responseData.answers.push(answer);
    });

    // 从 localStorage 获取现有的答卷记录
    let allResponses = JSON.parse(localStorage.getItem('surveyResponses')) || {};
    
    // 如果这个问卷还没有答卷记录，创建一个新数组
    if (!allResponses[surveyData.id]) {
        allResponses[surveyData.id] = [];
    }
    
    // 添加新的答卷记录
    allResponses[surveyData.id].push(responseData);

    // 保存回 localStorage
    localStorage.setItem('surveyResponses', JSON.stringify(allResponses));
}

function ret(){
    window.location.href ="../1-首页（问卷列表）/1-首页（问卷列表）.html";
}

