window.onload = function() {
    viewSurvey(); // 调用 viewSurvey 函数以显示问卷数据
};

// 获取问卷信息
function viewSurvey() {
    const blockDiv = document.getElementById('SurveyContent');
    blockDiv.style.display = 'block'; // 将 display 属性设置为 'block' 以显示该元素
    const surveyData = JSON.parse(localStorage.getItem('surveyData')); // 从 localStorage 获取问卷数据
    const surveyDisplay = document.getElementById('SurveyDisplay');
    const inputElement = document.querySelector('.input1'); // 获取 input 元素
    const deadlineInput = document.querySelector('input[type="date"]'); // 获取截止日期输入框

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
        
        // 显示截止日期
        deadlineInput.value = surveyData.deadline || '';
    } else {
        surveyDisplay.innerHTML = '<p>没有找到问卷数据！</p>';
        inputElement.value = '';
        inputElement.placeholder = '没有问卷可查看';
    }
}

// 发布问卷
document.querySelector('.publish').addEventListener('click', function() {
    // 弹出确认对话框
    const confirmPublish = confirm('确定要发布这份问卷吗？');
    if (confirmPublish) {
        // 获取当前问卷的id
        const currentSurvey = JSON.parse(localStorage.getItem('surveyData'));
        const surveyId = currentSurvey.id;
        
        // 获取问卷列表
        const surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
        
        // 找到当前问卷在列表中的索引
        const index = surveyDataList.findIndex(survey => survey.id === surveyId);
        
        if (index !== -1) {
            surveyDataList[index].isPublished = true; // 更新为已发布
            surveyDataList[index].publishDate = new Date().toISOString(); // 设置发布日期
            localStorage.setItem('surveyDataList', JSON.stringify(surveyDataList)); // 保存更改
            
            alert('问卷已发布！');
            
            // 返回问卷列表
            window.location.href = '../1-首页（问卷列表）/1-首页（问卷列表）.html';
        }
    }
});


function ret(){
    window.location.href ="../1-首页（问卷列表）/1-首页（问卷列表）.html";
}