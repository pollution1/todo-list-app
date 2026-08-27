/**
 * 待办事项应用主程序
 */

class TodoApp {
    constructor() {
        this.storage = new StorageManager();
        this.currentFilter = 'all';
        this.initElements();
        this.attachEventListeners();
        this.render();
    }

    /**
     * 初始化 DOM 元素
     */
    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
        this.emptyState = document.getElementById('emptyState');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.fileInput = document.getElementById('fileInput');
    }

    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        // 添加事项
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 清空已完成
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // 过滤按钮
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // 导出/导入
        this.exportBtn.addEventListener('click', () => this.storage.exportToJSON());
        this.importBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.importFromFile(e));
    }

    /**
     * 添加新待办事项
     */
    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (!text) {
            alert('请输入待办事项内容');
            this.todoInput.focus();
            return;
        }

        if (text.length > 200) {
            alert('输入内容不能超过 200 个字符');
            return;
        }

        this.storage.addTodo(text);
        this.todoInput.value = '';
        this.todoInput.focus();
        this.render();
    }

    /**
     * 删除待办事项
     * @param {number} id - 事项ID
     */
    deleteTodo(id) {
        if (confirm('确定要删除这个待办事项吗？')) {
            this.storage.deleteTodo(id);
            this.render();
        }
    }

    /**
     * 切换待办事项状态
     * @param {number} id - 事项ID
     */
    toggleTodo(id) {
        this.storage.toggleTodo(id);
        this.render();
    }

    /**
     * 清空所有已完成项
     */
    clearCompleted() {
        const stats = this.storage.getStats();
        if (stats.completed === 0) {
            alert('没有已完成的待办事项');
            return;
        }

        if (confirm(`确定要删除 ${stats.completed} 个已完成的待办事项吗？`)) {
            this.storage.clearCompleted();
            this.render();
        }
    }

    /**
     * 设置过滤条件
     * @param {string} filter - 过滤类型 (all, active, completed)
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新按钮状态
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    /**
     * 从文件导入
     * @param {Event} e - 文件改变事件
     */
    async importFromFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            await this.storage.importFromJSON(file);
            alert('导入成功！');
            this.render();
        } catch (error) {
            alert('导入失败: ' + error.message);
        }

        // 重置文件输入
        this.fileInput.value = '';
    }

    /**
     * 获取过滤后的待办事项
     * @returns {Array} 过滤后的事项
     */
    getFilteredTodos() {
        const todos = this.storage.getTodos();
        
        switch (this.currentFilter) {
            case 'active':
                return todos.filter(t => !t.completed);
            case 'completed':
                return todos.filter(t => t.completed);
            default:
                return todos;
        }
    }

    /**
     * 格式化日期
     * @param {string} dateStr - ISO 格式日期
     * @returns {string} 格式化后的日期
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    /**
     * 渲染页面
     */
    render() {
        const todos = this.getFilteredTodos();
        const stats = this.storage.getStats();

        // 更新统计信息
        this.totalCount.textContent = stats.total;
        this.activeCount.textContent = stats.active;
        this.completedCount.textContent = stats.completed;

        // 清空列表
        this.todoList.innerHTML = '';

        // 显示空状态或列表
        if (todos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.classList.add('show');
        } else {
            this.todoList.style.display = 'block';
            this.emptyState.classList.remove('show');
            
            // 创建列表项
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <span class="todo-date">${this.formatDate(todo.createdAt)}</span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">删除</button>
                `;
                
                this.todoList.appendChild(li);
            });
        }
    }

    /**
     * 转义 HTML 特殊字符
     * @param {string} text - 文本内容
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// 应用初始化
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});