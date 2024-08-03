import * as React from 'react';
import { Button} from '@fluentui/react-components';

export interface IXrmJsButtonProps {
  label: string | null,
  appearance: 'secondary' | 'primary' | 'outline' | 'subtle' | 'transparent',
  shape: 'rounded' | 'circular' | 'square',
  disabled: boolean,
  handler: () => void
}

const style = {
  width: "100%"
}

export class XrmJsButton extends React.Component<IXrmJsButtonProps> {
  public render(): React.ReactNode {
    return (
      <Button
        style={style}
        disabled={this.props.disabled}
        appearance={this.props.appearance}
        shape={this.props.shape}
        onClick={this.props.handler} >
        {this.props.label}
      </Button>
    );
  }
  private onClick(): void {
    this.props.handler();
  }
}