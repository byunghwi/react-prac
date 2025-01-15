class Queue {
  constructor() {
    this.front = null; // 큐의 맨 앞
    this.rear = null;  // 큐의 맨 뒤
    this.size = 0;     // 큐에 있는 데이터 수
  }

  // 큐에 데이터를 추가
  enqueue(data) {
    const newNode = { data, next: null }; // 새로운 노드 생성

    //큐가 비어있을 경우 front를 새 노드로 설정
    if (!this.front) {
      this.front = newNode; 
    }

    // 현재 맨 뒤 노드의 next를 새 노드로 설정
    if (this.rear) {
      this.rear.next = newNode;
    }
    this.rear = newNode; // 맨 뒤 노드가 새 노드를 가리키도록

    this.size++;
  }

  // 큐에서 데이터를 꺼내기
  dequeue() {
    // 큐가 비어있을 경우 null 반환
    if (!this.front) return null;

    // 큐가 있을 경우 front를 큐의 두 번째 요소로 설정하고, 제거된 노드의 data를 반환
    const dequeuedData = this.front.data;
    this.front = this.front.next;

    if (!this.front) {
      this.rear = null;
    }

    this.size--;
    return dequeuedData;
  }

  // 큐의 맨 앞 데이터를 꺼내지 않고 확인
  peek() {
    if (!this.front) return null;
    return this.front.data;
  }

  // 큐가 비었는지 확인
  isEmpty() {
    return this.size === 0;
  }

  // 큐의 크기 반환
  getSize() {
    return this.size;
  }
}

export default Queue;
