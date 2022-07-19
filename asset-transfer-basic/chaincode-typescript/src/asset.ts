/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    public docType?: string;

    @Property()
    public ID: string;

    @Property()
    public Object: string;

    @Property()
    public Pincodes: number[];

    @Property()
    public Owner: string;

    @Property()
    public ItemSold: boolean;

    @Property()
    public ShippingAddress: string;
}
