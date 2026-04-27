 """
CarbonLens — Pure Python Sorting Algorithm Implementations
All algorithms implemented in pure Python (no library sorts) so that
energy measurements reflect the actual algorithm, not a C extension.
"""


def insertion_sort(arr):
    """Insertion Sort — O(n²) time complexity."""
    a = arr.copy()
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a


def merge_sort(arr):
    """Merge Sort — O(n log n) time complexity."""
    if len(arr) <= 1:
        return arr[:]
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return _merge(left, right)


def _merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


def radix_sort(arr):
    """Radix Sort (LSD) — O(n) time complexity (for bounded integer keys)."""
    a = arr.copy()
    if not a:
        return a
    max_val = max(a)
    exp = 1
    while max_val // exp > 0:
        _counting_sort_radix(a, exp)
        exp *= 10
    return a


def _counting_sort_radix(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for i in range(n):
        index = (arr[i] // exp) % 10
        count[index] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for i in range(n - 1, -1, -1):
        index = (arr[i] // exp) % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1
    for i in range(n):
        arr[i] = output[i]


# Registry for easy lookup
ALGORITHMS = {
    "insertion_sort": insertion_sort,
    "merge_sort": merge_sort,
    "radix_sort": radix_sort,
}

ALGORITHM_INFO = {
    "insertion_sort": {"name": "Insertion Sort", "complexity": "O(n²)", "max_n": 100_000},
    "merge_sort": {"name": "Merge Sort", "complexity": "O(n log n)", "max_n": 1_000_000},
    "radix_sort": {"name": "Radix Sort", "complexity": "O(n)", "max_n": 1_000_000},
}
