// traces_to: L2-050, L2-051
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TarMarkdownEditor } from './tar-markdown-editor';

describe('TarMarkdownEditor (components library)', () => {
  let fixture: ComponentFixture<TarMarkdownEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarMarkdownEditor],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TarMarkdownEditor);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('valueChange emits when input event fires', () => {
    fixture.detectChanges();
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((v: string) => emitted.push(v));

    const textarea = fixture.nativeElement.querySelector('[data-testid="markdown-editor-textarea"]') as HTMLTextAreaElement;
    textarea.value = 'hello';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitted).toContain('hello');
  });

  it('does not accept input longer than maxLength', () => {
    fixture.componentRef.setInput('maxLength', 5);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('[data-testid="markdown-editor-textarea"]') as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(5);
  });
});
