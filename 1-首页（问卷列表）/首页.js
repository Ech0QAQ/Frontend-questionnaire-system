function delrow(btn) {
    var surveyItems = document.getElementById("SurveyItem").children;
    var item = btn.parentNode.parentNode; // 获取包含删除按钮的问卷项
    var index = Array.from(surveyItems).indexOf(item);
    // 弹出确认对话框
    var confirmDelete = confirm("确定要删除这份问卷吗？");
    if (confirmDelete) {
        var surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
        surveyDataList.splice(index, 1);
        localStorage.setItem('surveyDataList', JSON.stringify(surveyDataList));
        
        // 删除DOM元素
        // 先检查并删除其后的hr元素
        if (item.nextElementSibling && item.nextElementSibling.tagName === 'HR') {
            item.nextElementSibling.remove();
        }
        // 然后删除问卷项
        item.remove();
        alert('问卷已删除！');
    }
    // 如果删除后没有剩余的问卷，跳转到另一个页面
    if (surveyDataList.length === 0) {
        window.location.href = "../1-首页（无问卷）/1-首页无问卷.html";
    }
}

// 删除多项
function choosedel() {
    var chks = document.getElementsByName("chk");
    var surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
    var indicesToDelete = []; // 存储需要删除的索引

    // 首先收集所有选中的索引
    for (var i = 0; i < chks.length; i++) {
        if (chks[i].checked && chks[i].parentNode.parentNode.id !== "AllTopic") {
            indicesToDelete.push(i); // 记录选中复选框的索引
        }
    }

    if (indicesToDelete.length > 0) {
        // 弹出确认对话框
        var confirmDelete = confirm("确定要删除这些问卷吗？");
        if (confirmDelete) {
            // 反向删除，避免索引错误
            for (var i = indicesToDelete.length - 1; i >= 0; i--) {
                var index = indicesToDelete[i];
                surveyDataList.splice(index, 1);
            }
            // 更新 localStorage
            localStorage.setItem('surveyDataList', JSON.stringify(surveyDataList));

            // 删除DOM元素
            var surveyItems = document.getElementById("SurveyItem").children;
            for (var i = indicesToDelete.length - 1; i >= 0; i--) {
                surveyItems[indicesToDelete[i]].remove();
            }

            // 如果删除后没有剩余的问卷，跳转到另一个页面
            if (surveyDataList.length === 0) {
                window.location.href = "../1-首页（无问卷）/1-首页无问卷.html";
            }
            alert('问卷已删除！');
        }
    } else {
        alert("请至少选择一个问卷进行删除");
    }
}

function selectAll(selectAllCheckbox) {
    var chks = document.getElementsByName("chk");
    for (var i = 0; i < chks.length; i++) {
        chks[i].checked = selectAllCheckbox.checked;
    }
}

function creatnew() {
    window.location.href = "../2-编辑问卷页面/2-编辑问卷页面.html";
}

function updateTable() {
    const surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
    const surveyItemContainer = document.getElementById('SurveyItem');
    const today = new Date(); // 获取当前日期

    // 清空现有的问卷项
    surveyItemContainer.innerHTML = '';

    // 遍历问卷数据列表，为每个问卷创建一个显示项
    surveyDataList.forEach((surveyData, index) => {
        const surveyItem = document.createElement('div');
        surveyItem.className = "surveyOperation";
        const isPublished = surveyData.isPublished;
        
        // 检查是否过期
        const deadlineDate = surveyData.deadline ? new Date(surveyData.deadline) : null;
        const isExpired = deadlineDate ? today > deadlineDate : false;
        
        // 根据问卷状态设置按钮的disabled状态
        const publishButtonDisabled = isPublished ? 'disabled' : '';
        const editButtonDisabled = isPublished ? 'disabled' : '';
        // 如果问卷未发布或已过期，则禁用填写按钮
        const fillButtonDisabled = (!isPublished || isExpired) ? 'disabled' : '';
        const analyzeButtonDisabled = !isPublished ? 'disabled' : '';

        // 使用模板字符串构建问卷项的HTML结构
        surveyItem.innerHTML = `
            <div class="SurveyOperation">
                <div class="detail" style="margin-left: 10px;">
                    <input type="checkbox" name="chk" value="2">
                    <span>${surveyData.title}</span>
                </div>
                <div class="detail">${new Date(surveyData.creationDate).toLocaleDateString()}</div>
                <div class="detail">${surveyData.publishDate ? new Date(surveyData.publishDate).toLocaleDateString() : ''}</div>
                <div class="detail">${surveyData.deadline ? new Date(surveyData.deadline).toLocaleDateString() : ''}</div>
                <div class="detail">${surveyData.isPublished ? (isExpired ? '已过期' : '已发布') : '未发布'}</div>
                <div class="detail" style="margin-right: 10px;">
                    <input type="button" value="发布问卷" onclick="publishSurvey(${index})" ${publishButtonDisabled}>
                    <input type="button" value="编辑问卷" onclick="edit(${index})" ${editButtonDisabled}>
                    <input type="button" value="删除问卷" onclick="delrow(this)">
                    <input type="button" value="查看问卷" onclick="viewSurvey(${index})">
                    <input type="button" value="填写问卷" onclick="wri(${index})" ${fillButtonDisabled}>
                    <input type="button" value="数据分析" onclick="analysis(${index})" ${analyzeButtonDisabled}>
                </div>
            </div>
            <hr>
        `;
        // 将构建好的问卷项添加到容器中
        surveyItemContainer.appendChild(surveyItem);
    });
}

function publishSurvey(index) {
    const surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
    const surveyData = surveyDataList[index]; // 根据传入的索引获取问卷数据

    // 将选定的问卷数据存储到 localStorage
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
    window.location.href = "../3-发布问卷/发布问卷.html";
}

function viewSurvey(index) {
    const surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
    const surveyData = surveyDataList[index]; // 根据传入的索引获取问卷数据
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
    window.location.href = "../3-查看问卷/查看问卷.html";
}

function edit(index) {
    const surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
    const surveyData = surveyDataList[index]; // 根据传入的索引获取问卷数据
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
    window.location.href = "../4-编辑问卷/编辑问卷.html";
}

function wri(index) {
    const surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
    const surveyData = surveyDataList[index]; // 根据传入的索引获取问卷数据
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
    window.location.href = "../5-填写问卷/填写问卷.html";
}

function analysis(index) {
    const surveyDataList = JSON.parse(localStorage.getItem('surveyDataList')) || [];
    const surveyData = surveyDataList[index]; // 根据传入的索引获取问卷数据
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
    window.location.href = "../6-数据分析/数据分析.html";
}

// 在页面加载时调用 updateTable 函数
window.onload = function() {
    updateTable();
};