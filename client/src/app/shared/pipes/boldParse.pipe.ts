import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseBoldText'
})
export class ParseBoldTextPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return ''; // Return empty string if value is falsy

    // Regular expression to find text surrounded by **
    const regex = /\*\*(.*?)\*\*/g;

    // Replace the matched text with bold HTML tags
    return value.replace(regex, '<b>$1</b>');
  }
}
