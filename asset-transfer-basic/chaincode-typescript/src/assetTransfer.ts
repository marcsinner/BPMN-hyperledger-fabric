/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Asset} from './asset';
import json = Mocha.reporters.json;

@Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class AssetTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const assets: Asset[] = [
            {
                ID: 'asset1',
                Object: 'Skateboard',
                Pincodes: [80796, 80797, 80799, 80801, 80803, 80804],
                Owner: 'Tomoko',
                ItemSold: false,
                ShippingAddress: '',
            },
            {
                ID: 'asset2',
                Object: 'Skateboard',
                Pincodes: [80801, 80805, 80807, 80809],
                Owner: 'Brad',
                ItemSold: true,
                ShippingAddress: 'Franz-Joseph-Straße 45, 80801 München',
            },
            {
                ID: 'asset3',
                Object: 'Skateboard',
                Pincodes: [80798, 80799, 80801, 80803, 80807, 80809],
                Owner: 'Jin Soo',
                ItemSold: false,
                ShippingAddress: '',
            },
            {
                ID: 'asset4',
                Object: 'Laptop',
                Pincodes: [80796, 80797, 80807, 80809],
                Owner: 'Max',
                ItemSold: false,
                ShippingAddress: '',
            },
            {
                ID: 'asset5',
                Object: 'Laptop',
                Pincodes: [80803, 80807, 80809],
                Owner: 'Adriana',
                ItemSold: false,
                ShippingAddress: '',
            },
            {
                ID: 'asset6',
                Object: 'Laptop',
                Pincodes: [80796, 80797, 80798, 80799, 80801],
                Owner: 'Michel',
                ItemSold: true,
                ShippingAddress: 'Franz-Joseph-Straße 45, 80801 München',
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreateAsset(ctx: Context, id: string, object: string, pincodes: number[], owner: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            Object: object,
            Pincodes: pincodes,
            Owner: owner,
            ItemSold: false,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadAsset(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, id: string, object: string, pincodes: number[], owner: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Object: object,
            Pincodes: pincodes,
            Owner: owner,
            ItemSold: true,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferAsset(ctx: Context, id: string, newOwner: string, shippingAddress: string): Promise<string> {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        asset.ShippingAddress = shippingAddress;
        asset.ItemSold = true;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllAssetsByObject(ctx: Context, object: string): Promise<string> {
        const jsonAssets = await this.GetAllAssets(ctx);
        const assets = JSON.parse(jsonAssets);
        const allResults = [];
        for (const item of assets) {
            if (item.Object === object && !item.ItemSold) {
                allResults.push(item);
            }
        }
        return JSON.stringify(allResults);
    }

    // GetAssetAvailabilityByPincode
    @Transaction(false)
    @Returns('boolean')
    public async GetAssetAvailabilityByPincode(ctx: Context, id: string, pincode: number): Promise<boolean> {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        if (asset.Pincodes.includes(pincode)) {
            return true;
        }
        return false;
    }

}
