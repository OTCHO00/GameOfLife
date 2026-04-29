class Grid {
    constructor(width, height, cellSize) {

        this.pause = true;
        this.row = width / cellSize;
        this.col = height / cellSize;
        this.generation = 0;
        this.cells = new Set();

    }

    get_cells() {

        return this.cells;

    }

    cell_exist(r, c) {

        if (this.cells.has(`${r},${c}`)) {

            return true;

        } else {

            return false;

        }

    }

    toggle_cell(r, c) {

        if (this.cell_exist(r, c)) {

            this.cells.delete(`${r},${c}`);

        } else {

            this.cells.add(`${r},${c}`);
            
        }

    }

    count_neighbors(row, col) {

        let count_n = 0;

        let directions = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, -1],
            [1, 1],
            [-1, +1],
            [1, -1],
        ];

        for (let x = 0; x < directions.length; x++) {

            let ligne = directions[x];
            let r = row + ligne[0];
            let c = col + ligne[1]

            if (0 <= r && r < this.row) {

                if (0 <= c && c < this.col) {

                    if (this.cell_exist(r, c)) {

                        count_n += 1;

                    }

                }

            }

        }

        return count_n;

    }

    apply_rules(r, c, cnt_nbrs) {

        if (this.cell_exist(r, c)) {

            if (cnt_nbrs == 0 || cnt_nbrs == 1 || cnt_nbrs >= 4){

                return false;

            }

            if (cnt_nbrs == 2 || cnt_nbrs == 3) {

                return true;

            }

        } else {

            if (cnt_nbrs == 3) {

                return true;

            }

            else {

                return false;

            }

        }

        

    }

    insert_pattern() {}

    count_alives() {

        return this.cells.size

    }

    clear() {

        this.generation = 0;
        this.cells.clear();  

    }

    update() {

        let new_cells = new Set();

        for (let x = 0; x < this.row; x ++) {

            for (let y = 0; y < this.col; y ++) {

                let cnt_nbrs = this.count_neighbors(x, y);

                if (this.apply_rules(x, y, cnt_nbrs)) {

                    new_cells.add(`${x},${y}`);

                }

            }

        }

        this.cells = new_cells;

        if (this.cells.size > 0) {

            this.generation += 1;

        }

    }

}