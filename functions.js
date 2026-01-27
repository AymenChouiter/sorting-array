function swap(table,fir,sec){
    let temp = table[fir]
    table[fir] = table[sec]
    table[sec] = temp
}






function merget(Vec, left, mid, right) {
    let size = right - left
    let output = new Array(size);
    for (let i = left, j = mid, k = 0; k < size; k++) {
        if (i == mid) {
            output[k] = Vec[j++];
        } else if (j == right) {
            output[k] = Vec[i++];
        } else {
            if (Vec[i] <= Vec[j]) {
                output[k] = Vec[i++];
            } else {
                output[k] = Vec[j++];
            }
        }
    }

    for (let i = left; i < right; i++){
        Vec[i] = output[i-left];
    }
}
function part(obj, left, right) {
    let pivotIndex = right;
    let pivotValue = obj.table[pivotIndex];
    right--;
    while (true) {
        while (obj.table[left] < pivotValue) { left++; }
        while (left < right && obj.table[right] >= pivotValue) {
            right--;
        }
        if (left >= right) { break; }
        swap(obj.table, left, right);
    }
    swap(obj.table, left, pivotIndex);
    return left;
}

const quick = (obj , left , right)=>{
    if (left >= right) return;
    let pivot = part(obj, left, right);
    quick(obj, left, pivot-1);
    quick(obj, pivot + 1, right);
}
const merge = (obj, left,right)=>{
    if (right - left < 2) {
        return;
    }
    let mid = left + Math.floor((right - left) / 2)
    merge(obj, left, mid);
    merge(obj, mid, right);
    merget(obj.table, left, mid, right);
}
const insertion = (obj)=>{
    let current = obj.table[obj.num];
    let j = obj.num - 1;
    obj.colorTable = new Array(obj.table.length).fill("000000");
    while (j >= 0 && obj.table[j] > current) {
        obj.table[j + 1] = obj.table[j];
        j--;
    }
    obj.table[j + 1] = current;
    obj.colorTable[obj.num] = "e53e3e";
    obj.colorTable[obj.num+1] = "e53e3e";
}
const selection = (obj)=>{
    let min_index = obj.num;
    obj.colorTable = new Array(obj.table.length).fill("000000");
    for (let j = obj.num + 1; j < obj.table.length; j++){
        if (obj.table[j] < obj.table[min_index]) {
            min_index = j;
        }
    }
    if (min_index !== obj.num) {
        swap(obj.table, obj.num, min_index);
        obj.colorTable[obj.num] = "e53e3e";
        obj.colorTable[min_index] = "e53e3e";
    }
}
const bubble = (obj)=>{
    obj.colorTable = new Array(obj.table.length).fill("000000");
    if (obj.table[obj.numJ]> obj.table[obj.numJ+1]){
        swap(obj.table,obj.numJ,obj.numJ+1);
        obj.colorTable[obj.numJ] = "e53e3e";
        obj.colorTable[obj.numJ + 1] = "e53e3e";
        obj.selec = 1;
    }else{
        obj.selec = null;
        obj.colorTable[obj.numJ] = "48bb78";
        obj.colorTable[obj.numJ + 1] = "48bb78";
    }
}
module.exports = {
    insertion,
    selection,
    bubble,
    merge,
    quick
}