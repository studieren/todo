import { useState, useEffect } from "react";
import axios from "axios";

// 这是一个辅助函数，用于获取今天日期并计算出7天后的日期
const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  // 格式化为 YYYY-MM-DD，这是 <input type="date"> 所需要的格式
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function App() {
  // 初始化待办事项列表状态
  const [todoList, setTodoList] = useState([]);

  // 表单状态管理，在初始化时就设置好7天后的日期
  const [formData, setFormData] = useState({
    title: "",
    due_date: getFutureDate(7), // 默认设置为7天后的日期
  });

  const API_URL = "/api/v1";
  const get_url = `${API_URL}/todos`;

  // 获取所有待办事项
  const fetchTodos = () => {
    axios
      .get(get_url)
      .then((res) => {
        setTodoList(res.data);
      })
      .catch((error) => {
        console.error("获取待办事项失败:", error);
      });
    console.log(get_url);
    console.log(todoList);
  };

  // 组件挂载时获取待办事项列表，并设置默认日期
  useEffect(() => {
    fetchTodos();
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 标记待办事项为已完成或未完成
  const handleToggleComplete = (todo) => {
    // 根据当前状态切换 completed 的布尔值
    const updatedTodo = { ...todo, completed: !todo.completed };

    // 先乐观地更新UI，提升用户体验
    setTodoList(
      todoList.map((item) => (item.id === todo.id ? updatedTodo : item))
    );

    // 再调用API更新后端数据
    axios
      .put(`${API_URL}/todos/${todo.id}`, updatedTodo)
      .then((res) => {
        console.log("更新成功:", res.data);
      })
      .catch((error) => {
        console.error("更新失败:", error);
        // 失败时回滚UI状态
        fetchTodos();
      });
  };

  // 删除待办事项
  const handleDeleteTodo = (id) => {
    // 先更新UI
    setTodoList(todoList.filter((todo) => todo.id !== id));

    // 再调用API删除后端数据
    axios
      .delete(`${API_URL}/todos/${id}`)
      .then((res) => {
        console.log("删除成功:", res.data);
      })
      .catch((error) => {
        console.error("删除失败:", error);
        // 失败时回滚UI状态
        fetchTodos();
      });
  };

  // 提交表单添加新的待办事项
  const handleSubmit = (e) => {
    e.preventDefault();

    // 表单验证
    if (!formData.title.trim()) {
      alert("请输入待办事项标题");
      return;
    }

    const newTodo = {
      title: formData.title,
      completed: false,
      // 将日期转换为API需要的格式
      due_date: new Date(formData.due_date).toISOString(),
    };

    axios
      .post(`${API_URL}/todos`, newTodo)
      .then((res) => {
        console.log("添加成功:", res.data);
        // 添加成功后重新获取列表，保持数据同步
        fetchTodos();
        // 重置表单，并重新设置7天后的日期
        setFormData({
          title: "",
          due_date: getFutureDate(7),
        });
      })
      .catch((error) => {
        console.error("添加失败:", error);
      });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">待办事项列表</h1>

      {/* 添加新待办事项的表单 */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 p-4 border rounded-lg shadow-sm"
      >
        <h2 className="text-xl font-semibold mb-4">添加新任务</h2>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2 font-medium">
            任务标题
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="请输入任务标题"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="due_date" className="block mb-2 font-medium">
            截止日期
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          添加任务
        </button>
      </form>

      <ul className="space-y-4">
        {todoList.map((todo) => (
          <li
            key={todo.id}
            className="p-6 border rounded-lg shadow-md flex flex-col"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">{todo.title}</h3>
              <div className="flex-shrink-0 flex gap-2">
                <button
                  onClick={() => handleToggleComplete(todo)}
                  className={`text-white px-3 py-1 rounded-full text-xs ${
                    todo.completed
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  标记为{todo.completed ? "未完成" : "完成"}
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-full text-xs hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <span className="font-semibold">状态:</span>{" "}
                <span
                  className={
                    todo.completed ? "text-green-600" : "text-amber-600"
                  }
                >
                  {todo.completed ? "已完成" : "未完成"}
                </span>
              </p>
              <p>
                <span className="font-semibold">截止日期:</span>{" "}
                {new Date(todo.due_date).toLocaleDateString()}
              </p>
              <p className="mt-2 text-xs">
                创建时间: {new Date(todo.created_at).toLocaleString()}
              </p>
              {todo.updated_at && (
                <p className="text-xs">
                  更新时间: {new Date(todo.updated_at).toLocaleString()}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
