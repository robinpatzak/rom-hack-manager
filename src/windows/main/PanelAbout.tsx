import { Flex, Text } from "@chakra-ui/react";
import Panel from "../../components/Panel";
import Section from "../../components/Section";
import Website from "../../components/Website";

function PanelAbout() {
  return (
    <Panel>
      <Section isDefaultExpanded title="Useful links">
        <Flex alignItems="flex-start" direction="column" gap={1}>
          <Website
            href="https://github.com/zuccha/rom-hack-manager"
            label="Online documentation"
          />
          <Website
            href="https://www.smwcentral.net/?p=section&s=smwhacks"
            label="Super Mario World hacks"
          />
          <Website
            href="https://www.smwcentral.net/?p=section&s=yihacks"
            label="Yoshi's Island hacks"
          />
        </Flex>
      </Section>

      <Section isDefaultExpanded title="Credits">
        <Flex direction="column" gap={1} fontSize="sm">
          <Flex>
            <Text>Created by&nbsp;</Text>
            <Website href="https://zuccha.io" label="zuccha" />
          </Flex>

          <Flex>
            <Text>Contributors:&nbsp;</Text>
            <Website href="https://github.com/robinpatzak" label="Elegist" />
            ,&nbsp;
            <Website href="https://github.com/nick-sds" label="nick-sds" />
            ,&nbsp;
            <Website href="https://github.com/spigelli" label="spigelli" />
          </Flex>

          <Flex>
            <Text>Tools:&nbsp;</Text>
            <Website href="https://github.com/Alcaro/Flips" label="Flips" />
            <Text>&nbsp;by Alcaro,&nbsp;</Text>
            <Website
              href="https://projects.sappharad.com/multipatch/"
              label="MultiPatch"
            />
            <Text>&nbsp;by Paul Kratt</Text>
          </Flex>

          <Flex>
            <Text>API:&nbsp;</Text>
            <Website href="https://www.smwcentral.net/" label="SMW Central" />
          </Flex>
        </Flex>
      </Section>
    </Panel>
  );
}

export default PanelAbout;
