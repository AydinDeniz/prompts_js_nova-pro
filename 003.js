function dijkstra(graph, start, end) {
    const distances = {};
    const previous = {};
    let nodes = new Set();

    for (let vertex in graph) {
        distances[vertex] = vertex === start ? 0 : Infinity;
        previous[vertex] = null;
        nodes.add(vertex);
    }

    while (nodes.size) {
        let smallest = null;
        for (let node of nodes) {
            if (smallest === null || distances[node] < distances[smallest]) {
                smallest = node;
            }
        }

        if (smallest === end || distances[smallest] === Infinity) {
            break;
        }

        nodes.delete(smallest);

        for (let neighbor in graph[smallest]) {
            let alt = distances[smallest] + graph[smallest][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = smallest;
            }
        }
    }

    let path = [];
    let current = end;
    while (previous[current] !== null) {
        path.push(current);
        current = previous[current];
    }
    path.push(start);
    path.reverse();

    return {
        distance: distances[end],
        path: path
    };
}

// Example usage:
const graph = {
    'A': {'B': 1, 'C': 4},
    'B': {'A': 1, 'C': 2, 'D': 5},
    'C': {'A': 4, 'B': 2, 'D': 1},
    'D': {'B': 5, 'C': 1}
};

console.log(dijkstra(graph, 'A', 'D'));