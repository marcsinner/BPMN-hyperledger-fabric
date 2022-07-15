/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Product {
    @Property()
    public ID: string;

    @Property()
    public Object: string;

    @Property()
    public Pincodes: number[];

    @Property()
    public PhysicalOwner: string;

    @Property()
    public VirtualOwner: string;

    @Property()
    public AddressToShip: string;

    @Property()
    public TrackingInfo: string;

    @Property()
    public Sold: boolean;
}
