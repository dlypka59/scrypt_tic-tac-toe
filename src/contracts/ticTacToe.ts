import {
    prop, method, SmartContract, PubKey, FixedArray, assert, Sig, Utils, toByteString, hash160,
    hash256,
    fill,
    ContractTransaction,
    MethodCallOptions,
    bsv
} from "scrypt-ts";

export class TicTacToe extends SmartContract {
    @prop()
    alice: PubKey;
    @prop()
    bob: PubKey;

    @prop(true)
    isAliceTurn: boolean;

    @prop(true)
    board: FixedArray<bigint, 9>;

    static readonly EMPTY: bigint = 0n;
    static readonly ALICE: bigint = 1n;
    static readonly BOB: bigint = 2n;

    constructor(alice: PubKey, bob: PubKey) {
        super(...arguments)
        this.alice = alice;
        this.bob = bob;
        this.isAliceTurn = true;
        this.board = fill(TicTacToe.EMPTY, 9);
    }

    @method()
    public move(n: bigint, sig: Sig) {
        // check position `n`
        assert(n >= 0n && n < 9n);
        // check signature `sig`
        let player: PubKey = this.isAliceTurn ? this.alice : this.bob;
        assert(this.checkSig(sig, player), `checkSig failed, pubkey: ${player}`);
        // update stateful properties to make the move
        assert(this.board[Number(n)] === TicTacToe.EMPTY, `board at position ${n} is not empty: ${this.board[Number(n)]}`);
        let play = this.isAliceTurn ? TicTacToe.ALICE : TicTacToe.BOB;
        this.board[Number(n)] = play;
        this.isAliceTurn = !this.isAliceTurn;
        
        // build the transation outputs
        let outputs = toByteString('');
        if (this.won(play)) {
            outputs = Utils.buildPublicKeyHashOutput(hash160(player), this.ctx.utxo.value);
        }
        else if (this.full()) {
            const halfAmount = this.ctx.utxo.value / 2n;
            const aliceOutput = Utils.buildPublicKeyHashOutput(hash160(this.alice), halfAmount);
            const bobOutput = Utils.buildPublicKeyHashOutput(hash160(this.bob), halfAmount);
            outputs = aliceOutput + bobOutput;
        }
        else {
            // build a output that contains latest contract state.
            outputs = this.buildStateOutput(this.ctx.utxo.value);
        }

        if (this.changeAmount > 0n) {
            outputs += this.buildChangeOutput();
        }
        // make sure the transaction contains the expected outputs built above
        assert(this.ctx.hashOutputs === hash256(outputs), "check hashOutputs failed");
    }

    @method()
    won(play: bigint): boolean {

        /* let lines: FixedArray<FixedArray<bigint, 3>, 8> = [
            [0n, 1n, 2n],
            [3n, 4n, 5n],
            [6n, 7n, 8n],
            [0n, 3n, 6n],
            [1n, 4n, 7n],
            [2n, 5n, 8n],
            [0n, 4n, 8n],
            [2n, 4n, 6n]
        ]; */
/*
        let lines:string[ ][ ] = [ 
            ["0", "1", "2"],
            ["3", "4", "5"] //,
            //[6, 7, 8],
            //[0, 3, 6],
            //[1, 4, 7],
            //[2, 5, 8],
            //[0, 4, 8],
            //[2, 4, 6]
        ];
*/
/*
        let lines: FixedArray<FixedArray<Array<number>, 3>, 8>  = [ 
            [[0], [1], [2]],
            [[3], [4], [5]] //,
            //[6, 7, 8],
            //[0, 3, 6],
            //[1, 4, 7],
            //[2, 5, 8],
            //[0, 4, 8],
            //[2, 4, 6]
        ];       
*/
/*
        let lines: FixedArray<FixedArray<bigint, 3>, 8> = [ 
            [0n, 1n, 2n],
            [3n, 4n, 5n],
            [6n, 7n, 8n],
            [0n, 3n, 6n],
            [1n, 4n, 7n],
            [2n, 5n, 8n],
            [0n, 4n, 8n],
            [2n, 4n, 6n]
        ];      
*/
        let anyLine = false;

        for (let i = 0; i < 8; i++) {
            let line = true;
            for (let j = 0; j < 3; j++) { 
                //const strmyIndex0:string = (Number(lines[i][j])).toLocaleString();
                //const myIndex:number = Number(parseInt(strmyIndex0.replace("n", "")));
                //const myIndex:number = Number((lines[i][j]).valueOf().toString().replace("n", ""));
                //const strmyIndex0:string = (lines[i][j]).valueOf().toString().replace("n", "");
                //const myIndex:number = Number(parseInt(strmyIndex0));
 /* 
         0   [0n, 1n, 2n],
         1   [3n, 4n, 5n],
         2   [6n, 7n, 8n],
         3   [0n, 3n, 6n],
         4   [1n, 4n, 7n],
         5   [2n, 5n, 8n],
         6   [0n, 4n, 8n],
         7   [2n, 4n, 6n]

*/

                if (0 == i && 0 == j) {line = line && this.board[0] === play;}
                else
                if (0 == i && 1 == j) {line = line && this.board[1] === play;}
                else
                if (3 == i && 0 == j) {line = line && this.board[6] === play;}
                else
                if (3 == i && 1 == j) {line = line && this.board[7] === play;}
                else
                if (3 == i && 2 == j) {line = line && this.board[8] === play;}
                else
                if (1 == i && 1 == j) {line = line && this.board[4] === play;}
                else
                if (1 == i && 2 == j) {line = line && this.board[5] === play;}
                else
                if (2 == i && 0 == j) {line = line && this.board[6] === play;}
                else
                if (2 == i && 1 == j) {line = line && this.board[7] === play;}
                else
                if (2 == i && 2 == j) {line = line && this.board[8] === play;}
                else
                if (3 == i && 0 == j) {line = line && this.board[0] === play;}
                else
                if (3 == i && 1 == j) {line = line && this.board[3] === play;}
                else
                if (3 == i && 2 == j) {line = line && this.board[6] === play;}
                else
                if (4 == i && 0 == j) {line = line && this.board[1] === play;}
                else
                if (4 == i && 1 == j) {line = line && this.board[4] === play;}
                else
                if (4 == i && 2 == j) {line = line && this.board[7] === play;}
                else
                if (5 == i && 0 == j) {line = line && this.board[2] === play;}
                else
                if (5 == i && 1 == j) {line = line && this.board[5] === play;}
                else
                if (5 == i && 2 == j) {line = line && this.board[8] === play;}                          
                else
                if (6 == i && 0 == j) {line = line && this.board[0] === play;}
                else
                if (6 == i && 1 == j) {line = line && this.board[4] === play;}
                else
                if (6 == i && 2 == j) {line = line && this.board[8] === play;}
                else
                if (7 == i && 0 == j) {line = line && this.board[2] === play;}
                else
                if (7 == i && 1 == j) {line = line && this.board[4] === play;}
                else
                if (7 == i && 2 == j) {line = line && this.board[6] === play;}                 
            }

            console.log('Done the if()');

            anyLine = anyLine || line;
        }

        return anyLine;
    }

    @method()
    full(): boolean {
        let full = true;
        for (let i = 0; i < 9; i++) {
            full = full && this.board[i] !== TicTacToe.EMPTY;
        }
        return full;
    }

    static buildTxForMove(
        current: TicTacToe,
        options: MethodCallOptions<TicTacToe>,
        n: bigint
    ): Promise<ContractTransaction> {
        const play = current.isAliceTurn ? TicTacToe.ALICE : TicTacToe.BOB
        const nextInstance = current.next()
        nextInstance.board[Number(n)] = play
        nextInstance.isAliceTurn = !current.isAliceTurn

        const unsignedTx: bsv.Transaction = new bsv.Transaction().addInput(
            current.buildContractInput(options.fromUTXO)
        )

        if (nextInstance.won(play)) {
            const script = Utils.buildPublicKeyHashScript(
                hash160(current.isAliceTurn ? current.alice : current.bob)
            )
            unsignedTx
                .addOutput(
                    new bsv.Transaction.Output({
                        script: bsv.Script.fromHex(script),
                        satoshis: current.balance,
                    })
                )
            
            if (options.changeAddress) {
                unsignedTx.change(options.changeAddress)
            }

            return Promise.resolve({
                tx: unsignedTx,
                atInputIndex: 0,
                nexts: [],
            })
        }

        if (nextInstance.full()) {
            const halfAmount = current.balance / 2

            unsignedTx
                .addOutput(
                    new bsv.Transaction.Output({
                        script: bsv.Script.fromHex(
                            Utils.buildPublicKeyHashScript(
                                hash160(current.alice)
                            )
                        ),
                        satoshis: halfAmount,
                    })
                )
                .addOutput(
                    new bsv.Transaction.Output({
                        script: bsv.Script.fromHex(
                            Utils.buildPublicKeyHashScript(hash160(current.bob))
                        ),
                        satoshis: halfAmount,
                    })
                )

            if (options.changeAddress) {
                unsignedTx.change(options.changeAddress)
            }

            return Promise.resolve({
                tx: unsignedTx,
                atInputIndex: 0,
                nexts: [],
            })
        }

        unsignedTx
            .setOutput(0, () => {
                return new bsv.Transaction.Output({
                    script: nextInstance.lockingScript,
                    satoshis: current.balance,
                })
            })
            
            
        if (options.changeAddress) {
            unsignedTx.change(options.changeAddress)
        }
        

        const nexts = [
            {
                instance: nextInstance,
                atOutputIndex: 0,
                balance: current.balance,
            },
        ]

        return Promise.resolve({
            tx: unsignedTx,
            atInputIndex: 0,
            nexts,
            next: nexts[0],
        })

    }
}