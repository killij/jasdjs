//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

export class Dimensions {
    public height: number
    public width: number

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }

    public get cx () {
        return this.width / 2
    }

    public static readonly None: Dimensions = new Dimensions(0, 0) 
}