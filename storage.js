/**
 * LocalStorage 管理器
 * 处理所有本地存储操作
 */

class StorageManager {
    constructor() {
        this.storageKey = 'todoList';
    }

    /**
     * 获取所有待办事项
     * @returns {Array} 待办事项数组
     */
    getTodos() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('获取数据失败:', error);
            return [];
        }
    }

    /**
     * 保存所有待办事项
     * @param {Array} todos - 待办事项数组
     */
    saveTodos(todos) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(todos));
        } catch (error) {
            console.error('保存数据失败:', error);
            alert('数据保存失败，请检查存储空间');
        }
    }

    /**
     * 添加新待办事项
     * @param {string} text - 事项文本
     * @returns {Object} 新创建的待办事项
     */
    addTodo(text) {
        const todos = this.getTodos();
        const newTodo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        todos.push(newTodo);
        this.saveTodos(todos);
        return newTodo;
    }

    /**
     * 删除待办事项
     * @param {number} id - 事项ID
     */
    deleteTodo(id) {
        const todos = this.getTodos();
        const filtered = todos.filter(todo => todo.id !== id);
        this.saveTodos(filtered);
    }

    /**
     * 切换待办事项完成状态
     * @param {number} id - 事项ID
     */
    toggleTodo(id) {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos(todos);
        }
    }

    /**
     * 清空所有已完成的项
     */
    clearCompleted() {
        const todos = this.getTodos();
        const filtered = todos.filter(todo => !todo.completed);
        this.saveTodos(filtered);
    }

    /**
     * 导出数据为 JSON 文件
     */
    exportToJSON() {
        const todos = this.getTodos();
        const dataStr = JSON.stringify(todos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * 导入数据从 JSON 文件
     * @param {File} file - 要导入的文件
     * @returns {Promise<boolean>} 是否导入成功
     */
    async importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const todos = JSON.parse(e.target.result);
                    if (Array.isArray(todos)) {
                        this.saveTodos(todos);
                        resolve(true);
                    } else {
                        reject(new Error('无效的文件格式'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计对象 { total, active, completed }
     */
    getStats() {
        const todos = this.getTodos();
        return {
            total: todos.length,
            active: todos.filter(t => !t.completed).length,
            completed: todos.filter(t => t.completed).length
        };
    }

    /**
     * 清空所有数据
     */
    clearAll() {
        localStorage.removeItem(this.storageKey);
    }
}