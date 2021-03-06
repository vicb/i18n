require('source-map-support').install();

import * as fs from 'fs';

import {AppConfig, loadAppConfig} from './config';
import {Message} from './message_types';
import SerializerRegistry from './serializer';
import {parseHtml} from './parse_html';
import {parseMessages} from './parse_messages';

export class Extractor {
  constructor(public config: AppConfig) {}

  writeMessagesToJson(messages: Message[]) {
    var dst = this.config.dataDir + "/messages.json";
    console.log(`Writing JSON to file: ${dst}`);
    var jsonSerializer = SerializerRegistry.create('json');
    // TODO: jsonSerializer should be able to deal with a collection of messages.
    var jsonItems: string[] = [];
    messages.forEach(function(value) {
      jsonItems.push(jsonSerializer.stringify(value));
    });
    var jsonText = `[\n${jsonItems.join(",\n")}\n]`;
    fs.writeFileSync(dst, jsonText, {encoding: "utf-8"});
  }

  run() {
    var allMessages: Message[] = [];
    for (let src of this.config.htmlSrcs) {
      console.log(`Processing file: ${src}`);
      var html:string = fs.readFileSync(src, {encoding: "utf-8"});
      // assertValidHtml(html);
      parseMessages(parseHtml(html)).forEach(function(message: Message) {
        allMessages.push(message);
      });
      // todo: compare with previous extraction?
      // todo: what's the database?  where is it?
      // todo: the same message can be found in multiple source files
      // todo: what src file should be associated with the message?
    }
    this.writeMessagesToJson(allMessages);
  }
}

export default function main() {
  console.log("Using default application config (i18n.json)");
  new Extractor(loadAppConfig()).run();
}
