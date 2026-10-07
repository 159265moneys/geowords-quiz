import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {PHOTOS,PLATE_PHOTOS,VISUAL_PHOTOS,ROUTE_PHOTOS} from '../photo-data.js';
import {photoFigure,renderPhotoSet} from '../photo-view.js';
import {STEPS,ROUTES} from '../guide-data.js';
import {COUNTRY_QUESTIONS} from '../country-data.js';
import {renderCountryStage} from '../country-ui.js';

test('published photos contain credits and only vetted local raster assets',async()=>{
  const expected=new Set();
  const credits=await readFile(new URL('../PHOTO_CREDITS.md',import.meta.url),'utf8');
  for(const [id,p] of Object.entries(PHOTOS)){
    assert.match(p.src,/^assets\/photos\/[a-z0-9-]+\.jpg$/);
    assert.ok(p.width>0&&p.height>0&&p.label);
    assert.ok(p.author&&p.source&&p.license,id);
    assert.ok((await stat(new URL('../'+p.src,import.meta.url))).size>1000);
    assert.ok(credits.includes(p.src),id);
    expected.add(p.src.replace('assets/photos/',''));
    if(p.kind==='photo'){
      assert.equal(new URL(p.source).hostname,'commons.wikimedia.org');
      assert.match(p.license,/^(CC BY|CC0|Public domain)/);
    }else{
      assert.equal(p.kind,'generated');
      assert.match(photoFigure(id),/生成参考/);
    }
  }
  const files=await readdir(new URL('../assets/photos/',import.meta.url));
  assert.deepEqual(new Set(files),expected,'Do not ship unused or unblurred originals');
});

test('every plate example is mosaicked in the actual published image',()=>{
  const platePhotos=Object.values(PHOTOS).filter(p=>p.plate);
  assert.equal(platePhotos.length,16);
  for(const p of platePhotos){assert.equal(p.mosaic,true);assert.match(p.src,/-mosaic\.jpg$/);}
  for(const q of COUNTRY_QUESTIONS){
    if(q.clues.some(c=>c.kind==='plates')){
      assert.ok(PLATE_PHOTOS[q.country]?.length);
      for(const item of PLATE_PHOTOS[q.country])assert.equal(PHOTOS[Array.isArray(item)?item[0]:item].mosaic,true);
    }
    if(q.clues.some(c=>['plates','photo','sign','warning','crosswalk'].includes(c.kind)))assert.match(renderCountryStage(q),/<img /,q.id);
    else assert.ok(q.clues.every(c=>['observation','drive','text'].includes(c.kind)),q.id);
    assert.doesNotMatch(renderCountryStage(q),/plate-model|stop-model|warning-model|crosswalk-model|road-model/);
  }
});

test('all former teaching illustrations map to photographs with expansion controls',()=>{
  for(const card of STEPS.flatMap(s=>s.cards)){
    if(card.visual)assert.ok(VISUAL_PHOTOS[card.visual]?.length,card.visual);
  }
  for(const [key,items] of Object.entries({...VISUAL_PHOTOS,...PLATE_PHOTOS,...ROUTE_PHOTOS})){
    for(const item of items){
      const id=Array.isArray(item)?item[0]:item;
      assert.ok(PHOTOS[id],`${key}: ${id}`);
      assert.match(photoFigure(id),/data-photo=/);
      assert.match(photoFigure(id),/loading="lazy"/);
    }
    assert.doesNotMatch(renderPhotoSet(items),/undefined|NaN/);
  }
  for(const id of Object.keys(ROUTE_PHOTOS))assert.ok(ROUTES.some(r=>r.id===id));
});
