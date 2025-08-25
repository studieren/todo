# -*- coding: utf-8 -*-
import requests
import json
import time
import random
import csv

# Define the base URL for the backend API.
# 定义后端 API 的基础 URL
API_URL = "http://localhost:1111/api/v1"

# Test data for todo titles.
# 测试任务数据
TEST_TITLES = [
    "完成项目文档",
    "编写测试用例",
    "重构用户认证模块",
    "修复数据库连接问题",
    "更新前端UI样式",
    "准备项目演示PPT",
]


def create_todo(title):
    """
    Creates a new todo item.
    创建一个新的待办事项
    """
    url = f"{API_URL}/todos"
    due_date = time.strftime(
        "%Y-%m-%d", time.localtime(time.time() + 86400 * random.randint(1, 30))
    )
    data = {"title": title, "completed": False, "due_date": f"{due_date}T12:00:00Z"}
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"创建待办事项失败: {e}")
        return None


def get_todos():
    """
    Retrieves all todo items.
    获取所有待办事项
    """
    url = f"{API_URL}/todos"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"获取待办事项失败: {e}")
        return None


def update_todo(todo_id, completed):
    """
    Updates the completion status of a todo item.
    更新一个待办事项的状态
    """
    url = f"{API_URL}/todos/{todo_id}"
    data = {"completed": completed}
    try:
        response = requests.put(url, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"更新待办事项失败: {e}")
        return None


def delete_todo(todo_id):
    """
    Deletes a todo item.
    删除一个待办事项
    """
    url = f"{API_URL}/todos/{todo_id}"
    try:
        response = requests.delete(url)
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"删除待办事项失败: {e}")
        return False


def run_performance_test(iterations):
    """
    Runs a single performance test and returns timing data.
    运行单次性能测试，并返回耗时数据
    """
    print(f"开始测试，迭代次数: {iterations}")

    # List to store the IDs of successfully created todo items.
    # 用于记录成功创建的待办事项 ID
    created_todo_ids = []

    # Test creation operation.
    # 测试创建操作
    start_time = time.time()
    for i in range(iterations):
        title = random.choice(TEST_TITLES) + f" #{i + 1}"
        todo = create_todo(title)
        if todo and "id" in todo:
            created_todo_ids.append(todo["id"])
    create_duration = time.time() - start_time

    # Test read operation.
    # 测试读取操作
    start_time = time.time()
    get_todos()
    read_duration = time.time() - start_time

    # Test update operation.
    # 测试更新操作
    start_time = time.time()
    for todo_id in created_todo_ids:
        update_todo(todo_id, True)
    update_duration = time.time() - start_time

    # Test delete operation.
    # 测试删除操作
    start_time = time.time()
    for todo_id in created_todo_ids:
        delete_todo(todo_id)
    delete_duration = time.time() - start_time

    total_duration = create_duration + read_duration + update_duration + delete_duration

    return {
        "iterations": iterations,
        "create_time": create_duration,
        "read_time": read_duration,
        "update_time": update_duration,
        "delete_time": delete_duration,
        "total_time": total_duration,
    }


def save_to_csv(result, filename):
    """
    Appends a single test result to a CSV file. If the file does not exist,
    it creates the file and writes the header.
    将单个测试结果保存到 CSV 文件。如果文件不存在，则创建并写入表头。
    """
    fieldnames = result.keys()
    # Check if the file exists to determine if we need to write the header.
    # 检查文件是否存在以确定是否需要写入表头
    file_exists = False
    try:
        with open(filename, "r", newline="") as f:
            file_exists = True
    except FileNotFoundError:
        pass

    with open(filename, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerow(result)
    print(f"\n性能测试结果已保存到 {filename}")


if __name__ == "__main__":
    # A list of different iteration counts to test.
    # 定义一个包含不同测试次数的列表，脚本将自动遍历这些次数
    test_iterations = [10, 50, 100, 500, 1000]

    for iteration_count in test_iterations:
        result = run_performance_test(iteration_count)

        # Construct the filename with the iteration count.
        # 构造包含迭代次数的文件名
        filename = f"performance_results_{iteration_count}.csv"
        save_to_csv(result, filename)

        # Print current test results to the console.
        # 在控制台打印当前测试结果
        print("---")
        print(f"迭代次数: {result['iterations']}")
        print(f"创建操作总耗时: {result['create_time']:.2f} 秒")
        print(f"读取操作总耗时: {result['read_time']:.2f} 秒")
        print(f"更新操作总耗时: {result['update_time']:.2f} 秒")
        print(f"删除操作总耗时: {result['delete_time']:.2f} 秒")
        print(f"总耗时: {result['total_time']:.2f} 秒")
        print("---")
