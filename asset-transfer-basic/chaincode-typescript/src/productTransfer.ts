/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Product} from './product';

@Info({title: 'ProductTransfer', description: 'Smart contract for trading products'})
export class ProductTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const products: Product[] = [
            {
                ID: 'product1',
                Object: 'Skateboard',
                Pincodes: [80796, 80797, 80798, 80799, 80801, 80803, 80804],
                PhysicalOwner: 'Tomoko',
                VirtualOwner: 'Tomoko',
                AddressToShip: '',
                TrackingInfo: '',
                Sold: false,
            },
            {
                ID: 'product2',
                Object: 'Skateboard',
                Pincodes: [80804, 80805, 80807, 80809],
                PhysicalOwner: 'Brad',
                VirtualOwner: 'Brad',
                AddressToShip: '',
                TrackingInfo: '',
                Sold: false,
            },
            {
                ID: 'product3',
                Object: 'Laptop',
                Pincodes: [80798, 80799, 80801, 80803, 80807, 80809],
                PhysicalOwner: 'Jin Soo',
                VirtualOwner: 'Jin Soo',
                AddressToShip: '',
                TrackingInfo: '',
                Sold: false,
            },
            {
                ID: 'product4',
                Object: 'Laptop',
                Pincodes: [80796, 80797, 80807, 80809],
                PhysicalOwner: 'Max',
                VirtualOwner: 'Max',
                AddressToShip: '',
                TrackingInfo: '',
                Sold: false,
            },
            {
                ID: 'product5',
                Object: 'Monopoly',
                Pincodes: [80803, 80807, 80809],
                PhysicalOwner: 'Adriana',
                VirtualOwner: 'Adriana',
                AddressToShip: '',
                TrackingInfo: '',
                Sold: false,
            },
            {
                ID: 'product6',
                Object: 'Monopoly',
                Pincodes: [80796, 80797, 80798, 80799, 80801],
                PhysicalOwner: 'Michel',
                VirtualOwner: 'Michel',
                AddressToShip: '',
                TrackingInfo: '',
                Sold: false,
            },
        ];

        for (const product of products) {
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(product.ID, Buffer.from(stringify(sortKeysRecursive(product))));
            console.info(`Product ${product.ID} initialized`);
        }
    }

    // CreateProduct issues a new product to the world state with given details.
    @Transaction()
    public async CreateProduct(ctx: Context, id: string, object: string, pincodes: number[], owner: string): Promise<void> {
        const exists = await this.ProductExists(ctx, id);
        if (exists) {
            throw new Error(`The product ${id} already exists`);
        }

        const product = {
            ID: id,
            Object: object,
            Pincodes: pincodes,
            PhysicalOwner: owner,
            VirtualOwner: owner,
            AddressToShip: '',
            TrackingInfo: '',
            Sold: false,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(product))));
    }

    // ReadProduct returns the product stored in the world state with given id.
    @Transaction(false)
    public async ReadProduct(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the product from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The product ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateProduct updates an existing product in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, id: string, object: string, pincodes: number[], physicalOwner: string, virtualOwner: string, addressToShip: string, trackingInfo: string, sold: boolean): Promise<void> {
        const exists = await this.ProductExists(ctx, id);
        if (!exists) {
            throw new Error(`The product ${id} does not exist`);
        }

        // overwriting original product with new asset
        const updatedProduct = {
            ID: id,
            Object: object,
            Pincodes: pincodes,
            PhysicalOwner: physicalOwner,
            VirtualOwner: virtualOwner,
            AddressToShip: addressToShip,
            TrackingInfo: trackingInfo,
            Sold: sold,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedProduct))));
    }

    // ProductExists returns true when product with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async ProductExists(ctx: Context, id: string): Promise<boolean> {
        const productJSON = await ctx.stub.getState(id);
        return productJSON && productJSON.length > 0;
    }

    // TransferPhysicalProduct updates the physicalOwner field of product with given id in the world state, and returns the old physicalOwner.
    @Transaction()
    public async TransferPhysicalProduct(ctx: Context, id: string, newPhysicalOwner: string): Promise<string> {
        const productString = await this.ReadProduct(ctx, id);
        const product = JSON.parse(productString);
        const oldPhysicalOwner = product.PhysicalOwner;
        product.PhysicalOwner = newPhysicalOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(product))));
        return oldPhysicalOwner;
    }

    // TransferVirtualProduct updates the virtualOwner field of product with given id in the world state, and returns the old virtualOwner.
    @Transaction()
    public async TransferVirtualProduct(ctx: Context, id: string, newVirtualOwner: string): Promise<string> {
        const productString = await this.ReadProduct(ctx, id);
        const product = JSON.parse(productString);
        const oldVirtualOwner = product.VirtualOwner;
        product.VirtualOwner = newVirtualOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(product))));
        return oldVirtualOwner;
    }

    // GetAllProducts returns all products found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllProducts(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all products in the chaincode namespace.
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

    // GetAllProductsByObjectType returns all products with given object found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllProductsByObjectType(ctx: Context, object: string): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all products in the chaincode namespace.
        const iterator = await ctx.stub.getState(object);
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

    // CheckForProductAvailability returns true if the product with given id include the given pincode in the list of pincodes, false otherwise.

    // UpdateAddressToShip

    // UpdateTrackingInfo

    // UpdateOrderStatus ?

}
