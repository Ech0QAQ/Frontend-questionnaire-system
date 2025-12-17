window.onload = function() {
    viewSurvey();
    setupEventListeners();
};

// 添加全局变量
const questionData = []; // 用于存储问题的选项数目和其他信息

// 添加一个标志来跟踪是否已经加载过问卷
let hasLoaded = false;

function setupEventListeners() {
    // 使用事件委托处理所有按钮的点击事件
    document.getElementById('surveyDisplay').addEventListener('click', function(event) {
        
        // 处理增加选项的事件
        if (event.target.classList.contains('add-option')) {
            const parentDiv = event.target.closest('div');
            const answerDiv = parentDiv.querySelector('.answer');
            const questionIndex = parentDiv.querySelector('.question-sequence').textContent.trim().slice(0, -1);
            const questionDataIndex = questionIndex - 1;

            // 确保 questionData 中存在该问题的数据
            if (!questionData[questionDataIndex]) {
                questionData[questionDataIndex] = {
                    questionIndex: parseInt(questionIndex),
                    options: []
                };
            }

            const optionCount = questionData[questionDataIndex].options.length;
            const label = String.fromCharCode(65 + optionCount);

            // 检查问题类型（单选还是多选）
            const isCheckbox = answerDiv.querySelector('input[type="checkbox"]') !== null;
            const inputType = isCheckbox ? 'checkbox' : 'radio';

            // 创建新选项
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <input type="${inputType}" name="question${questionIndex}" disabled/> 
                <label>${label}.</label>
                <input type="text" class="length" name="" placeholder="选项" required/>
                <button class="delete-option">删除</button><br>
            `;
            
            answerDiv.appendChild(optionDiv);

            // 更新 questionData
            questionData[questionDataIndex].options.push({
                type: inputType,
                text: '',
                checked: false
            });

            updateOptionLabels(parentDiv);
        }
        
        // 处理删除选项的事件
        else if (event.target.classList.contains('delete-option')) {
            const optionDiv = event.target.closest('div');
            const answerDiv = optionDiv.parentElement;
            const questionDiv = event.target.closest('div[class^="question"]') || event.target.closest('div');
            const questionIndex = questionDiv.querySelector('.question-sequence').textContent.trim().slice(0, -1);
            const questionDataIndex = questionIndex - 1;
            const optionIndex = Array.from(answerDiv.children).indexOf(optionDiv);
            
            // 确保不是最后一个选项
            if (answerDiv.children.length > 1) {
                optionDiv.remove();
                // 从questionData中删除对应的选项
                if (questionData[questionDataIndex]) {
                    questionData[questionDataIndex].options.splice(optionIndex, 1);
                }

                // 重新排序当前问题的所有选项标签
                const remainingOptions = Array.from(answerDiv.children);
                remainingOptions.forEach((option, index) => {
                    const label = option.querySelector('label');
                    if (label) {
                        label.textContent = `${String.fromCharCode(65 + index)}.`;
                    }
                });
            } else {
                alert('至少需要保留一个选项！');
            }
        }
        
        // 处理删除整个问题的事件
        else if (event.target.classList.contains('delete-question')) {
            const questionBlock = event.target.closest('div');
            const questionIndex = questionBlock.querySelector('.question-sequence').textContent.trim().slice(0, -1);
            
            // 从questionData中删除对应的问题
            questionData.splice(questionIndex - 1, 1);
            
            questionBlock.remove();
            updateAllQuestions();
        }
    });

    // 添加新问题按钮事件
    document.querySelector('.add').addEventListener('click', function() {
        const surveyDisplay = document.getElementById('surveyDisplay');
        const questionCount = surveyDisplay.children.length;
        
        // 将新问题添加到questionData数组
        questionData.push({
            questionIndex: questionCount + 1,
            options: [] // 初始化选项数组
        });
        
        let questionDiv = document.createElement('div');
        questionDiv.innerHTML = `
            <span class="question-sequence">${questionCount + 1}.</span>
            <input type="text" name="" class="wenti" value="新问题" required/>
            <button class="add-option">增加选项</button>
            <button class="delete-question">删除问题</button><br>
            <div class="answer">
                <div>
                    <input type="radio" name="question${questionCount + 1}"/> 
                    <label>A.</label>
                    <input type="text" class="length" name="" placeholder="选项" required/>
                    <button class="delete-option">删除</button><br>
                </div>
            </div><br>
        `;
        surveyDisplay.appendChild(questionDiv);
        
        // 添加默认选项到questionData
        questionData[questionCount].options.push({
            type: 'radio',
            text: '',
            checked: false
        });
    });
}

// 更新选项标签的函数
function updateOptionLabels(questionDiv) {
    const answerDiv = questionDiv.querySelector('.answer');
    if (!answerDiv) return;

    // 获取当前问题下的所有选项，使用children来获取直接子元素
    const options = Array.from(answerDiv.children);
    options.forEach((option, index) => {
        const label = option.querySelector('label');
        if (label) {
            label.textContent = `${String.fromCharCode(65 + index)}.`;
        }
    });
}

// 更新所有问题的序号和questionData
function updateAllQuestions() {
    const questions = document.getElementById('surveyDisplay').children;
    Array.from(questions).forEach((question, index) => {
        const questionSequence = question.querySelector('.question-sequence');
        if (questionSequence) {
            questionSequence.textContent = `${index + 1}.`;
        }
        // 更新单选按钮的name属性
        const radioButtons = question.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.name = `question${index + 1}`;
        });
        
        // 更新questionData中的索引
        if (questionData[index]) {
            questionData[index].questionIndex = index + 1;
        }
    });
}

function viewSurvey() {
    const blockDiv = document.getElementById('SurveyContent');
    blockDiv.style.display = 'block'; // 将 display 属性设置为 'block' 以显示该元素
    const surveyData = JSON.parse(localStorage.getItem('surveyData')); // 从 localStorage 获取问卷数据
    const surveyDisplay = document.getElementById('surveyDisplay');
    const inputElement = document.querySelector('.input1'); // 获取 input 元素
    const deadlineInput = document.querySelector('input[type="date"]'); // 获取截止日期输入框

    surveyDisplay.innerHTML = ''; // 清空之前的内容

    if (surveyData) {
        // 更新 input 的 value 而不是 placeholder
        inputElement.value = surveyData.title; // 将问卷标题设置为输入框的值
        inputElement.placeholder = '请输入问卷标题';
        
        // 设置截止日期
        if (surveyData.deadline) {
            deadlineInput.value = surveyData.deadline;
        }

        // 初始化 questionData
        questionData.length = 0;

        surveyData.questions.forEach((q, index) => {
            questionData.push({
                questionIndex: index + 1,
                options: q.options.map(opt => ({
                    type: q.type, // 使用问题保存的类型
                    text: opt.text,
                    checked: opt.checked
                }))
            });

            let questionDiv = document.createElement('div');
            questionDiv.className = 'question';
            // 先创建问题的基本结构
            questionDiv.innerHTML = `
                <span class="question-sequence">${index + 1}.</span>
                <input type="text" name="" class="wenti" value="${q.question}" required/>
                ${q.type !== 'text' ? '<button class="add-option">增加选项</button>' : ''}
                <button class="delete-question">删除问题</button><br>
                <div class="answer"></div>
            `;
            
            // 获取answer div
            const answerDiv = questionDiv.querySelector('.answer');
    
            // 添加选项到answer div中
            if (q.options && q.options.length > 0) {
                if (q.type === 'text') {
                    // 文本题的特殊处理
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    optionDiv.innerHTML = `
                        <textarea class="length" rows="1" cols="50" placeholder="你的看法..." disabled></textarea><br>
                        <label>
                            <input type="checkbox" class="required-field" ${q.isRequired ? 'checked' : ''}/> 是否为必填题目
                        </label>
                    `;
                    answerDiv.appendChild(optionDiv);
                } else {
                    // 单选题和多选题的处理
                    q.options.forEach((option, optIndex) => {
                        const label = String.fromCharCode(65 + optIndex);
                        const optionDiv = document.createElement('div');
                        optionDiv.className = 'option';
                        optionDiv.innerHTML = `
                            <input type="${q.type}" name="question${index + 1}" ${option.checked ? 'checked' : ''} disabled/> 
                            <label>${label}.</label>
                            <input type="text" class="length" name="" placeholder="选项" value="${option.text}" required/>
                            <button class="delete-option">删除</button>
                        `;
                        answerDiv.appendChild(optionDiv);
                    });
                }
            }

            surveyDisplay.appendChild(questionDiv);
        });

        // 恢复发布状态
        const publishCheckbox = document.querySelector('#publish');
        if (publishCheckbox) {
            publishCheckbox.checked = surveyData.isPublished || false;
        }
    } else {
        surveyDisplay.innerHTML = '<p>没有找到问卷数据！</p>';
        inputElement.value = '';
        inputElement.placeholder = '没有问卷可查看';
    }

    // 标记问卷已加载
    hasLoaded = true;
}

// 保存问卷的函数
document.querySelector('.sub').addEventListener('click', function() {
    // 获取问卷标题
    const title = document.querySelector('.input1').value.trim();
    
    // 获取截止日期
    const deadline = document.querySelector('input[type="date"]').value;

    // 检查截止日期是否合理
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置时间为当天的0点
    const deadlineDate = new Date(deadline);
    if (deadlineDate < today) {
        alert('请选择合理的截止日期！');
        return;
    }

    // 获取问题块
    const questionBlocks = document.querySelectorAll('#surveyDisplay > div');

    // 检查问卷标题是否为空
    if (!title) {
        alert('请填写问卷标题。');
        return;
    }

    // 检查是否有问题
    if (questionBlocks.length === 0) {
        alert('问卷必须至少包含一个问题才能发布。');
        return;
    }

    // 检查每个问题和选项是否都已正确填写
    let isValid = true;
    let hasEmptyQuestion = false; // 用于跟踪是否已经提示过空问题
    let hasEmptyOption = false; // 用于跟踪是否已经提示过空选项

    questionBlocks.forEach((block) => {
        const questionText = block.querySelector('.wenti').value.trim();
        if (!questionText && !hasEmptyQuestion) {
            alert('请确保所有问题均已填写。');
            isValid = false;
            hasEmptyQuestion = true; // 标记已经提示过
            return;
        }

        // 检查问题类型
        const type = block.querySelector('input[type="radio"]') ? 'radio' :
                    block.querySelector('input[type="checkbox"]') ? 'checkbox' : 'text';

        // 只检查单选题和多选题的选项
        if (type !== 'text' && !hasEmptyOption) {
            const options = block.querySelectorAll('.answer > div');
            options.forEach((option) => {
                // 只检查选项输入框，不检查textarea
                const optionInput = option.querySelector('input[type="text"].length');
                if (optionInput && !optionInput.value.trim() && !hasEmptyOption) {
                    alert('请确保所有选项均已填写。');
                    isValid = false;
                    hasEmptyOption = true; // 标记已经提示过
                }
            });
        }
    });

    if (!isValid) {
        return;
    }

    // 准备更新的问卷数据
    const updatedSurveyData = {
        title: title,
        deadline: document.querySelector('input[type="date"]').value,
        isPublished: document.querySelector('#publish').checked,  // 添加发布状态
        publishDate: document.querySelector('#publish').checked ? new Date().toISOString() : null,
        questions: Array.from(questionBlocks).map(questionDiv => {
            // 获取问题类型
            const type = questionDiv.querySelector('input[type="radio"]') ? 'radio' :
                        questionDiv.querySelector('input[type="checkbox"]:not(.required-field)') ? 'checkbox' : 'text';

            const questionData = {
                question: questionDiv.querySelector('.wenti').value,
                type: type,
                options: []
            };

            // 处理选项
            if (type === 'text') {
                // 文本题
                const requiredField = questionDiv.querySelector('.required-field');
                questionData.isRequired = requiredField ? requiredField.checked : false;
                questionData.options = [{
                    text: '',
                    type: 'text'
                }];
            } else {
                // 单选题或多选题
                questionData.options = Array.from(questionDiv.querySelectorAll('.answer > div')).map(optionDiv => ({
                    text: optionDiv.querySelector('.length').value,
                    checked: optionDiv.querySelector(`input[type="${type}"]`).checked
                }));
            }

            return questionData;
        })
    };

    // 获取现有的问卷列表
    const surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
    
    if (surveyDataList.length > 0) {
        // 如果存在问卷，更新最后一个问卷
        const lastIndex = surveyDataList.length - 1;
        const originalSurvey = surveyDataList[lastIndex];
        surveyDataList[lastIndex] = {
            ...originalSurvey,           
            title: updatedSurveyData.title,
            deadline: updatedSurveyData.deadline,
            isPublished: updatedSurveyData.isPublished,  // 更新发布状态
            publishDate: updatedSurveyData.publishDate,
            questions: updatedSurveyData.questions
        };
    } else {
        // 如果没有问卷，添加新问卷
        surveyDataList.push(updatedSurveyData);
    }

    localStorage.setItem('surveyDataList', JSON.stringify(surveyDataList));
    if(document.querySelector('#publish').checked) {
        alert('问卷已发布！');
    }else{
        alert('问卷已保存！');
    }
    
    // 返回问卷列表
    window.location.href = '../1-首页（问卷列表）/1-首页（问卷列表）.html';
});

// 添加单选题
document.getElementById('add1').addEventListener('click', function() {
    addQuestion('radio');
});

// 添加多选题
document.getElementById('add2').addEventListener('click', function() {
    addQuestion('checkbox');
});

// 添加文本题
document.getElementById('add3').addEventListener('click', function() {
    addQuestion('text');
});

// 添加问题的通用函数
function addQuestion(type) {
    const surveyDisplay = document.getElementById('surveyDisplay');
    const questionCount = surveyDisplay.children.length;
    
    // 将新问题添加到questionData数组
    questionData.push({
        questionIndex: questionCount + 1,
        options: []
    });

    let questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
        <span class="question-sequence">${questionCount + 1}.</span>
        <input type="text" name="" class="wenti" placeholder="问题" required/>
        ${type !== 'text' ? '<button class="add-option">增加选项</button>' : ''}
        <button class="delete-question">删除问题</button><br>
        <div class="answer">
            ${type === 'radio' ? `
                <div class="option">
                    <input type="radio" name="question${questionCount + 1}" disabled/> 
                    <label>A.</label>
                    <input type="text" class="length" name="" placeholder="选项" required/>
                    <button class="delete-option">删除</button><br>
                </div>
                <div class="option">
                    <input type="radio" name="question${questionCount + 1}" disabled/>
                    <label>B.</label>
                    <input type="text" class="length" name="" placeholder="选项" required/>
                    <button class="delete-option">删除</button><br>
                </div>
            ` : type === 'checkbox' ? `
                <div class="option">
                    <input type="checkbox" name="question${questionCount + 1}" disabled/>
                    <label>A.</label>
                    <input type="text" class="length" name="" placeholder="选项" required/>
                    <button class="delete-option">删除</button><br>
                </div>
                <div class="option">
                    <input type="checkbox" name="question${questionCount + 1}" disabled/>
                    <label>B.</label>
                    <input type="text" class="length" name="" placeholder="选项" required/>
                    <button class="delete-option">删除</button><br>
                </div>
                <div class="option">
                    <input type="checkbox" name="question${questionCount + 1}" disabled/>
                    <label>C.</label>
                    <input type="text" class="length" name="" placeholder="选项" required/>
                    <button class="delete-option">删除</button><br>
                </div>
                <div class="option">
                    <input type="checkbox" name="question${questionCount + 1}" disabled/>
                    <label>D.</label>
                    <input type="text" class="length" name="" placeholder="选项" required/>
                    <button class="delete-option">删除</button><br>
                </div>
            ` : `
                <div class="option">
                    <textarea class="length" rows="1" cols="50" placeholder="你的看法..." disabled></textarea><br>
                    <input type="checkbox" class="required-field"/> 是否为必填题目
                </div>
            `}
        </div>
    `;
    
    surveyDisplay.appendChild(questionDiv);

    // 为单选题和多选题添加初始选项到questionData
    if (type !== 'text') {
        const initialOptionsCount = type === 'radio' ? 2 : 4; // 单选题2个选项，多选题4个选项
        for (let i = 0; i < initialOptionsCount; i++) {
            questionData[questionCount].options.push({
                type: type,
                text: '',
                checked: false
            });
        }
    }
}

// 只在点击 .button2 时控制显示/隐藏
var flag = 0;
function rise() {
    const questionOption = document.getElementById('Questionoption');
    if(flag == 0) {
        questionOption.style.display = 'grid';
        flag++;
    } else {
        questionOption.style.display = 'none';
        flag--;
    }
}

function ret(){
    window.location.href ="../1-首页（问卷列表）/1-首页（问卷列表）.html";
}