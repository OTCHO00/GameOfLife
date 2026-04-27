class Grid {
    constructor() {

        this.row = 10;
        this.col = 10;
        this.cells = new Set();
        this.generation = 0;

    }

    get_cells() {

        return this.cells;

    }

    cell_exist(r, c) {

        if (this.set.has(`${r}, ${c}`)) {

            return true;

        } else {

            return false;

        }

    }

    toggle_cel(r, c) {

        if (this.cell_exist(r, c)) {

            this.cells.delete(`${r},${c}`);

        } else {

            this.cells.add(`${r},${c}`);
            
        }

    }

    count_neighbors(r, c) {

        count_n = 0;

        directions = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, -1],
            [1, 1],
            [-1, +1],
            [1, -1],
        ];

        for (x = 0; x < directions.length; x++) {

            ligne = directions[x];
            [r, c] = [r + directions[0], c + directions[1]];

            if (0 <= r && r < this.row) {

                if (0 <= c && c < this.col) {

                    count_n += 1;

                }

            }

        }

        return count_n;

    }

    apply_rules(r, c, cnt_nbrs) {

        if (this.cell_exist()) {

            if (cnt_nbrs == 0 || cnt_nbrs == 1 || cnt_nbrs >= 4){

                return false;

            }

            if (cnt_nbrs == 2 || cnt_nbrs == 3) {

                return true;

            }

            else {

                if (cnt_nbrs == 3) {

                    return true;

                }

                else {

                    return false;

                }

            }

        }

    }

    insert_pattern() {}

    count_alives() {

        return this.cells.length

    }

    clear() {

        this.generation = 0;
        this.clear()

    }

    update() {

        new_cells = new Set();

        for (x = 0; x < this.row; x ++) {

            for (y = 0; y < this.col; y ++) {

                cnt_nbrs = this.count_neighbors(x, y);

                if (this.apply_rules(x, y, cnt_nbrs)) {

                    new_cells.add(`${x},${y}`);

                }

            }

        }

        this.cells = new_cells;
        this.generation += 1;

    }

}