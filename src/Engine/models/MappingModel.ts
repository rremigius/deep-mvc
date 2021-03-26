import {GenericMozel} from "mozel";

type KeysOfType<O,T> = {[K in keyof O]: O[K] extends T ? K : never}[keyof O];

export default class MappingModel<K,V> extends GenericMozel {
	// Index from the K type; values are keys from the V type that match the type of K at that index.
	MozelDataType:{[I in keyof K]?:KeysOfType<Exclude<V,undefined>,K[I]>} = {};
	/*
	Note: the `undefined` is because somehow the type with arguments: SomeType<A,B> with the above type fills in B|undefined.
	 */
};
