import bbox from '@turf/bbox';
import simplify from '@turf/simplify';

function scale(val, v1, v2, v3, v4) {
    return v3 + (v4 - v3) * ((val - v1) / (v2 - v1));
}

function scan(features, update = coords => coords, replace = true) {
    return features
        .map((feature) => {
            const geometryType = feature.geometry && feature.geometry.type;
            const coordinates = geometryType === 'Point' && update([feature.geometry.coordinates], 0)
                || geometryType === 'MultiPoint' && update(feature.geometry.coordinates, 0)
                || geometryType === 'LineString' && update(feature.geometry.coordinates, 0)
                || geometryType === 'MultiLineString' && feature.geometry.coordinates
                    .map((coords, idx) => update(coords, idx))
                || geometryType === 'Polygon' && feature.geometry.coordinates
                    .map((coords, idx) => update(coords, idx))
                    .filter(coords => coords.length > 0)
                || geometryType === 'MultiPolygon' && feature.geometry.coordinates
                    .map((group) => group
                        .map((coords, idx) => update(coords, idx))
                        .filter(coords => coords.length > 0)
                    )
                    .filter(coords => coords.length > 0);
            if (!replace) return feature;
            return coordinates.length > 0 
                ? {
                    ...feature,
                    geometry: {
                        ...feature.geometry,
                        coordinates: geometryType === 'Point'
                            ? coordinates[0]
                            : coordinates
                    }
                } 
                : null;
        })
        .filter(val => val);
}

function map(collection, params, projection) {
    const simplifiedCollection = params.simplify
        ? simplify(collection, params.simplify)
        : collection;
    const features = scan(
        (simplifiedCollection && simplifiedCollection.features || [])
            .filter(feature => feature && feature.geometry
                && (
                    feature.geometry.type === 'LineString'
                    || feature.geometry.type === 'MultiLineString'
                    || feature.geometry.type === 'Polygon'
                    || feature.geometry.type === 'MultiPolygon'
                )
            ),
        coords => coords.map((coord) => projection ? projection(coord) : coord)
    );

    const extent = bbox({ ...simplifiedCollection, features });
    const extentWidth = extent[2] - extent[0];
    const extentHeight = extent[3] - extent[1];

    const width = params.width;
    const height = params.height;

    const extentRatio = extentWidth / extentHeight;
    const ratio = width / height;

    const isHorizontal = extentRatio > ratio;

    const geometriesWidth = isHorizontal ? width : height * extentWidth / extentHeight;
    const geometriesHeight = isHorizontal ? width * extentHeight / extentWidth : height;

    const minx = isHorizontal ? 0 : params.centered ? width / 2 - geometriesWidth / 2 : 0;
    const miny = isHorizontal ? params.centered ? height / 2 - geometriesHeight / 2 : 0 : 0;
    const maxx = isHorizontal ? geometriesWidth : params.centered ? width / 2 + geometriesWidth / 2 : geometriesWidth;
    const maxy = isHorizontal ? params.centered ? height / 2 + geometriesHeight / 2 : geometriesHeight : geometriesHeight;

    return scan(
        features,
        coords =>
            coords
                .map(coord => [
                    scale(coord[0], extent[0], extent[2], minx, maxx),
                    scale(coord[1], extent[params.flipYCoords ? 1 : 3], extent[params.flipYCoords ? 3 : 1], miny, maxy)
                ])
                .map(coord => params.round
                    ? [Math.round(coord[0]), Math.round(coord[1])]
                    : coord
                )
    );
}

export default {
    map,
    scan
};